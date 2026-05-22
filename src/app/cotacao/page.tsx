"use client";

import { useState, useEffect } from "react";
import { StepIndicator } from "@/components/cotacao/StepIndicator";
import { Step1DadosBasicos } from "@/components/cotacao/Step1DadosBasicos";
import { Step2Hospitais } from "@/components/cotacao/Step2Hospitais";
import { Step3PerfilUso } from "@/components/cotacao/Step3PerfilUso";
import { Step4Resultado } from "@/components/cotacao/Step4Resultado";
import { Step5Pagamento } from "@/components/cotacao/Step5Pagamento";
import { Step6Documentos } from "@/components/cotacao/Step6Documentos";
import type { DadosCotacao, PlanoRecomendado } from "@/types";
import Link from "next/link";

const SESSION_KEY = "meuplano_session";
const DADOS_KEY = "meuplano_dados";

export default function CotacaoPage() {
  const [etapa, setEtapa] = useState(1);
  const [dados, setDados] = useState<DadosCotacao>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cotacaoId, setCotacaoId] = useState<string | null>(null);
  const [planoEscolhido, setPlanoEscolhido] = useState<PlanoRecomendado | null>(null);

  // Restaurar sessão do localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    const savedDados = localStorage.getItem(DADOS_KEY);
    if (savedSession) setSessionId(savedSession);
    if (savedDados) {
      try {
        setDados(JSON.parse(savedDados));
      } catch {
        // ignora dados corrompidos
      }
    }
  }, []);

  // Iniciar sessão no Supabase
  useEffect(() => {
    if (sessionId) return;
    const init = async () => {
      try {
        const res = await fetch("/api/sessao", { method: "POST" });
        const json = await res.json();
        if (json.id) {
          setSessionId(json.id);
          localStorage.setItem(SESSION_KEY, json.id);
        }
      } catch {
        // sessão local apenas
      }
    };
    init();
  }, [sessionId]);

  // Persistir dados localmente e no Supabase a cada mudança de etapa
  const atualizarDados = async (novosDados: Partial<DadosCotacao>) => {
    const dadosAtualizados = { ...dados, ...novosDados };
    setDados(dadosAtualizados);
    localStorage.setItem(DADOS_KEY, JSON.stringify(dadosAtualizados));

    if (sessionId) {
      try {
        await fetch(`/api/sessao/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dados_parciais: dadosAtualizados,
            etapa_atual: etapa,
          }),
        });
      } catch {
        // falha silenciosa — dados salvos localmente
      }
    }
  };

  const irPara = (novaEtapa: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEtapa(novaEtapa);
  };

  const handleEscolherPlano = (plano: PlanoRecomendado) => {
    setPlanoEscolhido(plano);
    irPara(6);
  };

  const handleConcluir = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(DADOS_KEY);
    window.location.href = "/conta";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logo no topo */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-bold text-gray-900">
              Meuplano<span className="text-gradient">.ai</span>
            </span>
          </Link>
        </div>
      </div>

      <StepIndicator etapaAtual={etapa} />

      <div className="min-h-[calc(100vh-112px)]">
        {etapa === 1 && (
          <Step1DadosBasicos
            dados={dados}
            onAtualizar={atualizarDados}
            onProximo={() => irPara(2)}
          />
        )}
        {etapa === 2 && (
          <Step2Hospitais
            dados={dados}
            onAtualizar={atualizarDados}
            onProximo={() => irPara(3)}
            onVoltar={() => irPara(1)}
            modo="hospitais"
          />
        )}
        {etapa === 3 && (
          <Step2Hospitais
            dados={dados}
            onAtualizar={atualizarDados}
            onProximo={() => irPara(4)}
            onVoltar={() => irPara(2)}
            modo="clinicas"
          />
        )}
        {etapa === 4 && (
          <Step3PerfilUso
            dados={dados}
            onAtualizar={atualizarDados}
            onProximo={() => irPara(5)}
            onVoltar={() => irPara(3)}
          />
        )}
        {etapa === 5 && (
          <Step4Resultado
            dados={dados}
            onAtualizar={atualizarDados}
            onEscolherPlano={handleEscolherPlano}
            onVoltar={() => irPara(4)}
            sessionId={sessionId}
          />
        )}
        {etapa === 6 && planoEscolhido && (
          <Step5Pagamento
            dados={dados}
            planoEscolhido={planoEscolhido}
            onProximo={() => irPara(7)}
            onVoltar={() => irPara(5)}
          />
        )}
        {etapa === 7 && planoEscolhido && (
          <Step6Documentos
            dados={dados}
            planoEscolhido={planoEscolhido}
            cotacaoId={cotacaoId}
            onVoltar={() => irPara(6)}
            onConcluir={handleConcluir}
          />
        )}
      </div>
    </div>
  );
}
