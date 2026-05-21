"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { formatarMoeda } from "@/lib/utils";
import {
  ArrowLeft,
  Loader2,
  Send,
  CheckCircle2,
  MessageCircle,
  FileText,
  Download,
} from "lucide-react";
import Link from "next/link";
import type { StatusProposta } from "@/types";

const STATUS_OPCOES: { valor: StatusProposta; label: string }[] = [
  { valor: "aguardando_revisao", label: "Aguardando revisão" },
  { valor: "em_analise", label: "Em análise" },
  { valor: "documentos_solicitados", label: "Solicitar documentos" },
  { valor: "transmitida", label: "Marcar como transmitida" },
  { valor: "boleto_enviado", label: "Boleto enviado" },
  { valor: "contratada", label: "Contratada" },
  { valor: "recusada", label: "Recusar proposta" },
];

export default function PropostaDetalhe() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [proposta, setProposta] = useState<any>(null);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoStatus, setNovoStatus] = useState<StatusProposta | "">("");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const checarAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.push("/painel/login");
    };
    checarAuth();
    buscarProposta();
  }, [id]);

  const buscarProposta = async () => {
    setLoading(true);
    const res = await fetch(`/api/painel/propostas/${id}`);
    const json = await res.json();
    if (json.data) {
      setProposta(json.data.proposta);
      setDocumentos(json.data.documentos ?? []);
      setNovoStatus(json.data.proposta.status);
      setObservacoes(json.data.proposta.observacoes ?? "");
    }
    setLoading(false);
  };

  const handleSalvar = async () => {
    setSalvando(true);
    const res = await fetch(`/api/painel/propostas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: novoStatus,
        observacoes,
      }),
    });
    const json = await res.json();
    if (!json.error) {
      await buscarProposta();
    }
    setSalvando(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (!proposta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Proposta não encontrada.</p>
          <Link href="/painel">
            <Button variant="outline" className="mt-4">
              Voltar ao painel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const cotacao = proposta.cotacao;
  const dadosCotacao = cotacao.dados_cotacao ?? {};

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/painel">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
          <span className="text-sm font-medium text-gray-500">
            Proposta #{id.slice(0, 8)}
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="md:col-span-2 space-y-6">
            {/* Dados do cliente */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Dados do cliente</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs font-medium">E-mail</p>
                  <p className="font-medium">{dadosCotacao.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">WhatsApp</p>
                  <p className="font-medium">
                    {dadosCotacao.telefone ?? "—"}
                    {dadosCotacao.telefone && (
                      <a
                        href={`https://wa.me/${dadosCotacao.telefone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener"
                        className="ml-2 text-brand-green text-xs font-semibold"
                      >
                        Abrir WA
                      </a>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">Localidade</p>
                  <p className="font-medium">
                    {dadosCotacao.endereco
                      ? `${dadosCotacao.endereco.localidade}/${dadosCotacao.endereco.uf}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">CEP</p>
                  <p className="font-medium">{dadosCotacao.cep ?? "—"}</p>
                </div>
              </div>
              {/* Beneficiários */}
              {dadosCotacao.beneficiarios && (
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-2">
                    Beneficiários
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dadosCotacao.beneficiarios.map(
                      (b: { idade: number }, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 rounded-lg text-sm"
                        >
                          {b.idade} anos
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Plano escolhido */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
              <h2 className="font-bold text-gray-900">Plano escolhido</h2>
              {cotacao.plano_escolhido ? (
                <div className="space-y-2 text-sm">
                  <p className="text-lg font-extrabold">
                    {cotacao.plano_escolhido.operadora?.nome}
                  </p>
                  <p className="text-gray-700">{cotacao.plano_escolhido.nome}</p>
                  {cotacao.valor_mensal && (
                    <p className="text-xl font-bold text-brand-blue">
                      {formatarMoeda(cotacao.valor_mensal)}/mês
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Plano não identificado</p>
              )}
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
              <h2 className="font-bold text-gray-900">
                Documentos ({documentos.length})
              </h2>
              {documentos.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  Nenhum documento enviado ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {documentos.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {doc.tipo.replace("_", " ").toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {doc.nome_arquivo}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.url_storage}
                        target="_blank"
                        rel="noopener"
                        className="text-brand-blue"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coluna lateral — ações */}
          <div className="space-y-6">
            {/* Status atual */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-gray-900">Atualizar status</h2>
              <select
                value={novoStatus}
                onChange={(e) =>
                  setNovoStatus(e.target.value as StatusProposta)
                }
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {STATUS_OPCOES.map((s) => (
                  <option key={s.valor} value={s.valor}>
                    {s.label}
                  </option>
                ))}
              </select>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Observações internas
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Anotações sobre esta proposta..."
                />
              </div>

              <Button
                onClick={handleSalvar}
                disabled={salvando}
                className="w-full"
              >
                {salvando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Salvar alterações
                  </>
                )}
              </Button>
            </div>

            {/* Histórico de status */}
            {proposta.historico_status?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                <h2 className="font-bold text-gray-900">Histórico</h2>
                <div className="space-y-3">
                  {[...proposta.historico_status].reverse().map(
                    (h: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-700">{h.status}</p>
                          <p className="text-gray-400">
                            {new Date(h.timestamp).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
