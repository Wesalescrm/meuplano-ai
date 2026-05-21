"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, MapPin, User, Users } from "lucide-react";
import type { DadosCotacao, Beneficiario, EnderecoViaCEP, TipoPlano } from "@/types";

interface Step1Props {
  dados: DadosCotacao;
  onAtualizar: (dados: Partial<DadosCotacao>) => void;
  onProximo: () => void;
}

type TipoDisplay = "individual" | "familiar" | "empresarial" | "mei";

interface PlanCard {
  valor: TipoDisplay;
  label: string;
  desc: string;
  emoji: string;
}

const PLANOS_1_PESSOA: PlanCard[] = [
  { valor: "individual", label: "Individual", desc: "Cobertura só para você", emoji: "👤" },
  { valor: "mei", label: "MEI", desc: "Microempreendedor Individual", emoji: "🏪" },
];

const PLANOS_MULTI: PlanCard[] = [
  { valor: "familiar", label: "Familiar", desc: "Você + dependentes", emoji: "👨‍👩‍👧" },
  { valor: "empresarial", label: "Empresa", desc: "Pessoa jurídica (LTDA, SA…)", emoji: "🏢" },
];

function labelBeneficiario(idx: number) {
  if (idx === 0) return "Titular (você)";
  return `Dependente ${idx}`;
}

function tipoParaSalvar(tipo: TipoDisplay): TipoPlano {
  if (tipo === "mei") return "individual";
  return tipo as TipoPlano;
}

export function Step1DadosBasicos({ dados, onAtualizar, onProximo }: Step1Props) {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>(
    dados.beneficiarios && dados.beneficiarios.length > 0
      ? dados.beneficiarios
      : [{ idade: 0 }]
  );
  const [cep, setCep] = useState(dados.cep ?? "");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepErro, setCepErro] = useState("");
  const [endereco, setEndereco] = useState<EnderecoViaCEP | null>(
    dados.endereco ?? null
  );
  const [tipo, setTipo] = useState<TipoDisplay>(dados.tipo_plano ?? "individual");

  const total = beneficiarios.length;

  const setTotal = (novoTotal: number) => {
    if (novoTotal < 1 || novoTotal > 8) return;
    if (novoTotal > total) {
      const extras: Beneficiario[] = Array.from(
        { length: novoTotal - total },
        () => ({ idade: 0 })
      );
      setBeneficiarios((prev) => [...prev, ...extras]);
    } else {
      setBeneficiarios((prev) => prev.slice(0, novoTotal));
    }
    if (novoTotal === 1 && (tipo === "familiar" || tipo === "empresarial")) {
      setTipo("individual");
    }
    if (novoTotal > 1 && (tipo === "individual" || tipo === "mei")) {
      setTipo("familiar");
    }
  };

  const atualizarIdade = (idx: number, valor: string) => {
    const num = parseInt(valor);
    if (isNaN(num) || num < 0 || num > 120) return;
    setBeneficiarios((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, idade: num } : b))
    );
  };

  const buscarCEP = async (digits: string) => {
    setCepLoading(true);
    setCepErro("");
    try {
      const res = await fetch(`/api/viacep?cep=${digits}`);
      const data: EnderecoViaCEP = await res.json();
      if (data.erro) {
        setCepErro("CEP não encontrado");
        setEndereco(null);
      } else {
        setEndereco(data);
      }
    } catch {
      setCepErro("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (valor: string) => {
    const digits = valor.replace(/\D/g, "").slice(0, 8);
    const formatted =
      digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);
    if (digits.length === 8) buscarCEP(digits);
  };

  const podeProximar = () => {
    if (beneficiarios.some((b) => !b.idade || b.idade <= 0)) return false;
    if (!cep || cep.replace(/\D/g, "").length !== 8) return false;
    if (!endereco || endereco.erro) return false;
    return true;
  };

  const handleProximo = () => {
    onAtualizar({
      beneficiarios,
      cep: cep.replace(/\D/g, ""),
      endereco: endereco ?? undefined,
      tipo_plano: tipoParaSalvar(tipo),
    });
    onProximo();
  };

  const planos = total === 1 ? PLANOS_1_PESSOA : PLANOS_MULTI;

  return (
    <div className="step-transition max-w-xl mx-auto px-4 py-8 space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1.5">
          Vamos começar com o básico
        </h1>
        <p className="text-gray-500 text-sm">
          Diga quantas pessoas vão no plano e onde você mora.
        </p>
      </div>

      {/* SEÇÃO: Pessoas */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Users className="w-4 h-4 text-brand-blue" />
          Quantas pessoas vão no plano?
        </div>

        {/* Contador */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
          <span className="text-sm text-gray-600 font-medium">
            {total === 1 ? "1 pessoa" : `${total} pessoas`}
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTotal(total - 1)}
              disabled={total <= 1}
              className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 hover:border-brand-blue hover:text-brand-blue disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              −
            </button>
            <span className="w-5 text-center font-extrabold text-xl text-gray-900">
              {total}
            </span>
            <button
              onClick={() => setTotal(total + 1)}
              disabled={total >= 8}
              className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center text-xl font-bold text-white hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              +
            </button>
          </div>
        </div>

        {/* Idade de cada pessoa */}
        <div className="space-y-2">
          {beneficiarios.map((b, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 px-4 py-3"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-brand-blue" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">{labelBeneficiario(idx)}</p>
                <div className="flex items-baseline gap-1.5">
                  <input
                    type="number"
                    placeholder="—"
                    value={b.idade || ""}
                    onChange={(e) => atualizarIdade(idx, e.target.value)}
                    min={0}
                    max={120}
                    className="w-14 text-center font-bold text-lg text-gray-900 border-0 border-b-2 border-gray-200 focus:border-brand-blue outline-none bg-transparent pb-0.5 transition-colors"
                  />
                  <span className="text-sm text-gray-400">anos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO: CEP */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <MapPin className="w-4 h-4 text-brand-blue" />
          Qual é o seu CEP?
        </div>
        <Input
          type="text"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => handleCepChange(e.target.value)}
          maxLength={9}
          error={cepErro}
          hint={cepLoading ? "Buscando endereço…" : undefined}
        />
        {endereco && !endereco.erro && (
          <div className="flex items-center gap-2 px-4 py-3 bg-brand-green-light rounded-xl text-sm text-brand-green-dark">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>
              {endereco.bairro ? `${endereco.bairro}, ` : ""}
              {endereco.localidade} — {endereco.uf}
            </span>
          </div>
        )}
      </section>

      {/* SEÇÃO: Tipo de plano */}
      <section className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Tipo de plano</p>
        <div className="grid grid-cols-2 gap-3">
          {planos.map((p) => (
            <button
              key={p.valor}
              onClick={() => setTipo(p.valor)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                tipo === p.valor
                  ? "border-brand-blue bg-brand-blue-light shadow-sm"
                  : "border-gray-100 bg-white hover:border-brand-blue/30"
              }`}
            >
              <span className="text-2xl mb-2 block">{p.emoji}</span>
              <p
                className={`font-bold text-sm ${
                  tipo === p.valor ? "text-brand-blue" : "text-gray-800"
                }`}
              >
                {p.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{p.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <Button
        onClick={handleProximo}
        disabled={!podeProximar()}
        className="w-full"
        size="lg"
      >
        Continuar
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
