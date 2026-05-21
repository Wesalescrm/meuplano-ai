"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ArrowRight, Users, MapPin } from "lucide-react";
import type { DadosCotacao, Beneficiario, EnderecoViaCEP, TipoPlano } from "@/types";

interface Step1Props {
  dados: DadosCotacao;
  onAtualizar: (dados: Partial<DadosCotacao>) => void;
  onProximo: () => void;
}

const TIPOS_PLANO: { valor: TipoPlano; label: string; desc: string }[] = [
  { valor: "individual", label: "Individual", desc: "Só para você" },
  { valor: "familiar", label: "Familiar", desc: "Para a família" },
  { valor: "empresarial", label: "Empresarial / MEI", desc: "Para empresa" },
];

export function Step1DadosBasicos({ dados, onAtualizar, onProximo }: Step1Props) {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>(
    dados.beneficiarios ?? [{ idade: 0 }]
  );
  const [cep, setCep] = useState(dados.cep ?? "");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepErro, setCepErro] = useState("");
  const [endereco, setEndereco] = useState<EnderecoViaCEP | null>(
    dados.endereco ?? null
  );
  const [tipo, setTipo] = useState<TipoPlano>(dados.tipo_plano ?? "individual");

  const adicionarBeneficiario = () => {
    setBeneficiarios((prev) => [...prev, { idade: 0 }]);
  };

  const removerBeneficiario = (idx: number) => {
    if (beneficiarios.length === 1) return;
    setBeneficiarios((prev) => prev.filter((_, i) => i !== idx));
  };

  const atualizarIdade = (idx: number, valor: string) => {
    const num = parseInt(valor);
    if (isNaN(num) || num < 0 || num > 120) return;
    setBeneficiarios((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, idade: num } : b))
    );
  };

  const buscarCEP = async (valor: string) => {
    const digits = valor.replace(/\D/g, "");
    if (digits.length !== 8) return;
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
      digits.length > 5
        ? `${digits.slice(0, 5)}-${digits.slice(5)}`
        : digits;
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
      tipo_plano: tipo,
    });
    onProximo();
  };

  return (
    <div className="step-transition max-w-xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Vamos começar com o básico
        </h1>
        <p className="text-gray-500">
          Informe as idades dos beneficiários e sua localização.
        </p>
      </div>

      {/* Beneficiários */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Users className="w-4 h-4 text-brand-blue" />
          Quem vai ser incluído no plano?
        </div>
        <div className="space-y-2">
          {beneficiarios.map((b, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder={`Idade da pessoa ${idx + 1}`}
                  value={b.idade || ""}
                  onChange={(e) => atualizarIdade(idx, e.target.value)}
                  min={0}
                  max={120}
                />
              </div>
              {beneficiarios.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removerBeneficiario(idx)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={adicionarBeneficiario}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4" />
          Adicionar pessoa
        </Button>
      </div>

      {/* CEP */}
      <div className="space-y-3">
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
          hint={cepLoading ? "Buscando endereço..." : undefined}
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
      </div>

      {/* Tipo de plano */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Tipo de plano</p>
        <div className="grid grid-cols-3 gap-3">
          {TIPOS_PLANO.map((t) => (
            <button
              key={t.valor}
              onClick={() => setTipo(t.valor)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                tipo === t.valor
                  ? "border-brand-blue bg-brand-blue-light"
                  : "border-gray-100 hover:border-brand-blue/30"
              }`}
            >
              <p
                className={`font-bold text-sm ${
                  tipo === t.valor ? "text-brand-blue" : "text-gray-800"
                }`}
              >
                {t.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Botão */}
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
