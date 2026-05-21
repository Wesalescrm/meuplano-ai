"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Gem,
  Scale,
  CheckCircle2,
  XCircle,
  Hospital,
  ArrowRight,
} from "lucide-react";
import { formatarMoeda } from "@/lib/utils";
import type { DadosCotacao, PlanoRecomendado } from "@/types";

interface Step4Props {
  dados: DadosCotacao;
  onAtualizar: (dados: Partial<DadosCotacao>) => void;
  onEscolherPlano: (plano: PlanoRecomendado) => void;
  onVoltar: () => void;
  sessionId: string | null;
}

const CATEGORIA_CONFIG = {
  melhor_custo_beneficio: {
    emoji: "🏆",
    label: "Melhor custo-benefício",
    cor: "text-yellow-600 bg-yellow-50 border-yellow-200",
    destaque: true,
    icon: Trophy,
  },
  melhor_plano: {
    emoji: "💎",
    label: "Melhor plano disponível",
    cor: "text-purple-600 bg-purple-50 border-purple-200",
    destaque: false,
    icon: Gem,
  },
  meio_termo_1: {
    emoji: "⚖️",
    label: "Meio-termo",
    cor: "text-brand-blue bg-brand-blue-light border-brand-blue/20",
    destaque: false,
    icon: Scale,
  },
  meio_termo_2: {
    emoji: "⚖️",
    label: "Alternativa equilibrada",
    cor: "text-brand-blue bg-brand-blue-light border-brand-blue/20",
    destaque: false,
    icon: Scale,
  },
};

function CardPlano({
  recomendacao,
  onEscolher,
}: {
  recomendacao: PlanoRecomendado;
  onEscolher: () => void;
}) {
  const config = CATEGORIA_CONFIG[recomendacao.categoria];
  const carencias = recomendacao.plano.carencias as Record<string, number>;

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
        config.destaque
          ? "border-yellow-300 shadow-yellow-100 shadow-md"
          : "border-gray-100"
      }`}
    >
      {/* Header do card */}
      <div
        className={`px-5 py-3 flex items-center justify-between border-b ${config.cor}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.emoji}</span>
          <span className="font-bold text-sm">{config.label}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background:
                recomendacao.score >= 80
                  ? "#00C48C"
                  : recomendacao.score >= 60
                  ? "#0057FF"
                  : "#f59e0b",
            }}
          />
          <span className="text-xs font-bold">
            {recomendacao.score}% compatível
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4 bg-white">
        {/* Operadora e plano */}
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {recomendacao.operadora.nome}
          </p>
          <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
            {recomendacao.plano.nome}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant="secondary">{recomendacao.plano.modalidade}</Badge>
            <Badge variant="secondary">{recomendacao.plano.abrangencia}</Badge>
            {recomendacao.plano.telemedicina && (
              <Badge variant="green">Telemedicina</Badge>
            )}
            {recomendacao.plano.reembolso && (
              <Badge variant="default">Reembolso</Badge>
            )}
          </div>
        </div>

        {/* Preço */}
        <div className="flex items-end justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-xs text-gray-500">Mensalidade total</p>
            <p className="text-2xl font-extrabold text-gray-900">
              {formatarMoeda(recomendacao.preco_total_mensal)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Por pessoa</p>
            <p className="text-lg font-bold text-gray-700">
              {formatarMoeda(recomendacao.preco_por_pessoa)}
            </p>
          </div>
        </div>

        {/* Coparticipação */}
        <div className="flex items-center gap-2 text-sm">
          {recomendacao.plano.coparticipacao ? (
            <>
              <span className="text-orange-500 font-medium">Com coparticipação</span>
              <span className="text-gray-400">
                (~{recomendacao.plano.coparticipacao_percentual}% por consulta)
              </span>
            </>
          ) : (
            <span className="text-brand-green font-medium">Sem coparticipação</span>
          )}
        </div>

        {/* Hospitais cobertos */}
        {recomendacao.hospitais_cobertos.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              <Hospital className="w-3.5 h-3.5 text-brand-green" />
              Seus hospitais cobertos
            </p>
            {recomendacao.hospitais_cobertos.map((h) => (
              <div key={h.place_id} className="flex items-center gap-2 text-xs text-brand-green">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                {h.nome}
              </div>
            ))}
          </div>
        )}

        {recomendacao.hospitais_nao_cobertos.length > 0 && (
          <div className="space-y-1.5">
            {recomendacao.hospitais_nao_cobertos.map((h) => (
              <div key={h.place_id} className="flex items-center gap-2 text-xs text-gray-400">
                <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {h.nome} (não coberto)
              </div>
            ))}
          </div>
        )}

        {/* Coberturas */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">
            Coberturas incluídas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(recomendacao.plano.coberturas as string[])
              .slice(0, 5)
              .map((c, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-1 rounded-lg"
                >
                  {c}
                </span>
              ))}
          </div>
        </div>

        {/* Principais carências */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "consultas", label: "Consultas" },
            { key: "internacao", label: "Internação" },
            { key: "urgencia", label: "Urgência" },
            { key: "parto", label: "Parto" },
          ].map(({ key, label }) => (
            <div key={key} className="p-2 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400 font-medium">{label}</p>
              <p className="text-sm font-bold text-gray-700">
                {carencias[key] === 0
                  ? "Sem carência"
                  : `${carencias[key]} dias`}
              </p>
            </div>
          ))}
        </div>

        {/* Pontos positivos */}
        {recomendacao.motivos_positivos.length > 0 && (
          <div className="space-y-1">
            {recomendacao.motivos_positivos.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-brand-green">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {m}
              </div>
            ))}
          </div>
        )}

        {recomendacao.motivos_negativos.length > 0 && (
          <div className="space-y-1">
            {recomendacao.motivos_negativos.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {m}
              </div>
            ))}
          </div>
        )}

        <Button onClick={onEscolher} className="w-full" variant="green">
          Quero este plano
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function Step4Resultado({
  dados,
  onAtualizar,
  onEscolherPlano,
  onVoltar,
  sessionId,
}: Step4Props) {
  const [recomendacoes, setRecomendacoes] = useState<PlanoRecomendado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [email, setEmail] = useState(dados.email ?? "");
  const [telefone, setTelefone] = useState(dados.telefone ?? "");
  const [planoPendente, setPlanoPendente] = useState<PlanoRecomendado | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const buscar = async () => {
      setLoading(true);
      setErro("");
      try {
        const res = await fetch("/api/cotacao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dados, sessionId }),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setRecomendacoes(json.data ?? []);
      } catch (e) {
        setErro("Não foi possível calcular as recomendações. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    buscar();
  }, []);

  const handleEscolher = (plano: PlanoRecomendado) => {
    setPlanoPendente(plano);
    setMostrarModal(true);
  };

  const handleConfirmar = async () => {
    if (!email || !telefone || !planoPendente) return;
    setSalvando(true);
    try {
      const res = await fetch("/api/cotacao/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          email,
          telefone,
          planoId: planoPendente.plano.id,
          valorMensal: planoPendente.preco_total_mensal,
          score: planoPendente.score,
          dados,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onAtualizar({ email, telefone });
      setMostrarModal(false);
      onEscolherPlano(planoPendente);
    } catch {
      alert("Erro ao salvar cotação. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-brand-blue" />
        </div>
        <p className="text-gray-600 font-medium">Analisando os melhores planos para você...</p>
        <p className="text-sm text-gray-400">Isso leva alguns segundos</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-red-500 font-medium">{erro}</p>
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="step-transition max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
          Seus planos recomendados
        </h1>
        <p className="text-gray-500 text-sm">
          Selecionamos os {recomendacoes.length} melhores planos para o seu perfil.
        </p>
      </div>

      <div className="grid gap-6">
        {recomendacoes.map((r) => (
          <CardPlano
            key={r.plano.id}
            recomendacao={r}
            onEscolher={() => handleEscolher(r)}
          />
        ))}
      </div>

      {recomendacoes.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          <p>Nenhum plano encontrado para os critérios informados.</p>
          <Button variant="outline" className="mt-4" onClick={onVoltar}>
            <ArrowLeft className="w-4 h-4" />
            Ajustar critérios
          </Button>
        </div>
      )}

      <Button variant="ghost" onClick={onVoltar} size="sm" className="mx-auto block">
        <ArrowLeft className="w-4 h-4" />
        Ajustar preferências
      </Button>

      {/* Modal de cadastro */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Salvar sua cotação
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Informe seu e-mail e telefone para salvar a cotação e receber
                orientações pelo WhatsApp.
              </p>
            </div>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="WhatsApp / Telefone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setMostrarModal(false)}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                variant="green"
                disabled={!email || !telefone || salvando}
                onClick={handleConfirmar}
              >
                {salvando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirmar escolha"
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Seus dados são usados apenas para enviar sua cotação.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
