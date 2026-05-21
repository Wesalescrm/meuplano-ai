"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";
import type { DadosCotacao } from "@/types";

interface Step3Props {
  dados: DadosCotacao;
  onAtualizar: (dados: Partial<DadosCotacao>) => void;
  onProximo: () => void;
  onVoltar: () => void;
}

type FrequenciaUso = "raramente" | "as_vezes" | "frequentemente";

function OpcaoBinaria({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: boolean | undefined;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        {([true, false] as const).map((opcao) => (
          <button
            key={String(opcao)}
            onClick={() => onChange(opcao)}
            className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
              valor === opcao
                ? "border-brand-blue bg-brand-blue-light text-brand-blue"
                : "border-gray-100 text-gray-600 hover:border-brand-blue/30"
            }`}
          >
            {opcao ? "Sim" : "Não"}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Step3PerfilUso({ dados, onAtualizar, onProximo, onVoltar }: Step3Props) {
  const [frequencia, setFrequencia] = useState<FrequenciaUso | undefined>(
    dados.frequencia_uso
  );
  const [preexistente, setPreexistente] = useState<boolean | undefined>(
    dados.tem_condicao_preexistente
  );
  const [medicamentos, setMedicamentos] = useState<boolean | undefined>(
    dados.usa_medicamentos_continuos
  );
  const [exames, setExames] = useState<boolean | undefined>(
    dados.faz_exames_rotina
  );
  const [telemedicina, setTelemedicina] = useState<boolean | undefined>(
    dados.prefere_telemedicina
  );
  const [coparticipacao, setCoparticipacao] = useState<boolean | undefined>(
    dados.prefere_coparticipacao
  );
  const [orcamento, setOrcamento] = useState(dados.orcamento_por_pessoa ?? 400);

  const FREQUENCIAS: { valor: FrequenciaUso; label: string; desc: string }[] = [
    { valor: "raramente", label: "Raramente", desc: "Emergências ou check-up anual" },
    { valor: "as_vezes", label: "Às vezes", desc: "Consultas esporádicas" },
    { valor: "frequentemente", label: "Frequentemente", desc: "Uso mensal ou mais" },
  ];

  const tudoPreenchido = () => {
    return (
      frequencia !== undefined &&
      preexistente !== undefined &&
      medicamentos !== undefined &&
      exames !== undefined &&
      telemedicina !== undefined &&
      coparticipacao !== undefined
    );
  };

  const handleProximo = () => {
    onAtualizar({
      frequencia_uso: frequencia,
      tem_condicao_preexistente: preexistente,
      usa_medicamentos_continuos: medicamentos,
      faz_exames_rotina: exames,
      prefere_telemedicina: telemedicina,
      prefere_coparticipacao: coparticipacao,
      orcamento_por_pessoa: orcamento,
    });
    onProximo();
  };

  return (
    <div className="step-transition max-w-xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Seu perfil de saúde
        </h1>
        <p className="text-gray-500 text-sm">
          Essas informações nos ajudam a encontrar o plano certo para você.
        </p>
      </div>

      {/* Frequência */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">
          Com que frequência você usa o plano de saúde?
        </p>
        <div className="grid gap-3">
          {FREQUENCIAS.map((f) => (
            <button
              key={f.valor}
              onClick={() => setFrequencia(f.valor)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                frequencia === f.valor
                  ? "border-brand-blue bg-brand-blue-light"
                  : "border-gray-100 hover:border-brand-blue/30"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  frequencia === f.valor
                    ? "border-brand-blue bg-brand-blue"
                    : "border-gray-300"
                }`}
              />
              <div>
                <p
                  className={`font-semibold text-sm ${
                    frequencia === f.valor ? "text-brand-blue" : "text-gray-800"
                  }`}
                >
                  {f.label}
                </p>
                <p className="text-xs text-gray-400">{f.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Perguntas binárias */}
      <OpcaoBinaria
        label="Tem alguma condição pré-existente ou doença crônica?"
        valor={preexistente}
        onChange={setPreexistente}
      />

      <OpcaoBinaria
        label="Usa medicamentos de uso contínuo?"
        valor={medicamentos}
        onChange={setMedicamentos}
      />

      <OpcaoBinaria
        label="Faz exames de rotina regularmente?"
        valor={exames}
        onChange={setExames}
      />

      <OpcaoBinaria
        label="Prefere consultas por telemedicina?"
        valor={telemedicina}
        onChange={setTelemedicina}
      />

      {/* Coparticipação */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">
          Qual modelo de pagamento você prefere?
        </p>
        <div className="grid gap-3">
          {[
            {
              valor: true,
              label: "Mensalidade menor",
              desc: "Pago uma taxa por consulta (coparticipação)",
            },
            {
              valor: false,
              label: "Mensalidade fixa",
              desc: "Pago mais por mês, mas sem taxa ao usar",
            },
          ].map((op) => (
            <button
              key={String(op.valor)}
              onClick={() => setCoparticipacao(op.valor)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                coparticipacao === op.valor
                  ? "border-brand-blue bg-brand-blue-light"
                  : "border-gray-100 hover:border-brand-blue/30"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  coparticipacao === op.valor
                    ? "border-brand-blue bg-brand-blue"
                    : "border-gray-300"
                }`}
              />
              <div>
                <p
                  className={`font-semibold text-sm ${
                    coparticipacao === op.valor ? "text-brand-blue" : "text-gray-800"
                  }`}
                >
                  {op.label}
                </p>
                <p className="text-xs text-gray-400">{op.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Orçamento */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            Orçamento mensal por pessoa
          </p>
          <span className="text-lg font-extrabold text-brand-blue">
            {formatarMoeda(orcamento)}
          </span>
        </div>
        <Slider
          min={100}
          max={3000}
          step={50}
          value={[orcamento]}
          onValueChange={([v]) => setOrcamento(v)}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>R$ 100</span>
          <span>R$ 3.000</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onVoltar} size="lg" className="flex-1">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Button>
        <Button
          onClick={handleProximo}
          disabled={!tudoPreenchido()}
          size="lg"
          className="flex-1"
        >
          Ver resultados
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
