"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CreditCard, FileText, Repeat } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";
import type { DadosCotacao, PlanoRecomendado } from "@/types";

interface Step5Props {
  dados: DadosCotacao;
  planoEscolhido: PlanoRecomendado;
  onProximo: () => void;
  onVoltar: () => void;
}

const CARENCIAS_LABELS: Record<string, string> = {
  consultas: "Consultas médicas",
  exames_simples: "Exames simples",
  exames_complexos: "Exames complexos / imagem",
  internacao: "Internação clínica",
  parto: "Parto",
  urgencia: "Urgência e emergência",
};

export function Step5Pagamento({ dados, planoEscolhido, onProximo, onVoltar }: Step5Props) {
  const beneficiarios = dados.beneficiarios ?? [];
  const hoje = new Date();
  const inicioVigencia = new Date(hoje);
  inicioVigencia.setDate(1);
  inicioVigencia.setMonth(inicioVigencia.getMonth() + 1);
  const carencias = planoEscolhido.plano.carencias as Record<string, number>;

  const formasPagamento = [
    { id: "boleto", icon: <FileText className="w-5 h-5" />, label: "Boleto bancário" },
    { id: "cartao", icon: <CreditCard className="w-5 h-5" />, label: "Cartão de crédito" },
    { id: "debito", icon: <Repeat className="w-5 h-5" />, label: "Débito automático" },
  ];

  return (
    <div className="step-transition max-w-xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Resumo e pagamento
        </h1>
        <p className="text-gray-500 text-sm">
          Confira os detalhes antes de enviar os documentos.
        </p>
      </div>

      {/* Plano escolhido */}
      <div className="p-5 rounded-2xl border-2 border-brand-blue bg-brand-blue-light space-y-3">
        <div>
          <p className="text-xs text-brand-blue font-semibold uppercase tracking-wide">
            {planoEscolhido.operadora.nome}
          </p>
          <p className="text-xl font-extrabold text-gray-900">
            {planoEscolhido.plano.nome}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Mensalidade</p>
            <p className="text-2xl font-extrabold text-brand-blue">
              {formatarMoeda(planoEscolhido.preco_total_mensal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Início da vigência</p>
            <p className="text-base font-bold text-gray-700">
              {inicioVigencia.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Beneficiários e valores */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Beneficiários</p>
        <div className="space-y-2">
          {beneficiarios.map((b, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl"
            >
              <span className="text-sm text-gray-700">
                {b.nome ?? `Beneficiário ${i + 1}`} — {b.idade} anos
              </span>
              <span className="text-sm font-bold text-gray-900">
                {formatarMoeda(planoEscolhido.preco_por_pessoa)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 px-4 bg-brand-blue-light rounded-xl">
            <span className="text-sm font-bold text-brand-blue">Total mensal</span>
            <span className="text-lg font-extrabold text-brand-blue">
              {formatarMoeda(planoEscolhido.preco_total_mensal)}
            </span>
          </div>
        </div>
      </div>

      {/* Formas de pagamento */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Formas de pagamento</p>
        <div className="grid gap-2">
          {formasPagamento.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center">
                {f.icon}
              </div>
              <span className="text-sm font-medium text-gray-700">{f.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          A forma de pagamento é definida na contratação junto ao especialista.
        </p>
      </div>

      {/* Tabela de carências */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Tabela de carências</p>
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                  Serviço
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">
                  Carência
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Object.entries(carencias).map(([key, dias]) => (
                <tr key={key} className="bg-white">
                  <td className="px-4 py-3 text-gray-700">
                    {CARENCIAS_LABELS[key] ?? key}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {dias === 0 ? (
                      <span className="text-brand-green">Sem carência</span>
                    ) : (
                      <span className="text-gray-700">{dias} dias</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onVoltar} size="lg" className="flex-1">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Button>
        <Button onClick={onProximo} size="lg" className="flex-1" variant="green">
          Enviar documentos
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
