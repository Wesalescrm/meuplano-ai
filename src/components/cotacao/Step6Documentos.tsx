"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Loader2,
  FileText,
  X,
  MessageCircle,
} from "lucide-react";
import type { DadosCotacao, PlanoRecomendado } from "@/types";

interface Step6Props {
  dados: DadosCotacao;
  planoEscolhido: PlanoRecomendado;
  cotacaoId: string | null;
  onVoltar: () => void;
  onConcluir: () => void;
}

interface ArquivoUpload {
  file: File;
  tipo: string;
  beneficiario?: string;
  uploading: boolean;
  done: boolean;
  error: string;
}

const DOCUMENTOS_NECESSARIOS = [
  { tipo: "rg", label: "RG ou CNH", desc: "De cada beneficiário adulto", obrigatorio: true },
  { tipo: "cpf", label: "CPF", desc: "De cada beneficiário", obrigatorio: true },
  {
    tipo: "comprovante_residencia",
    label: "Comprovante de residência",
    desc: "Conta de luz, água ou telefone (últimos 3 meses)",
    obrigatorio: true,
  },
  {
    tipo: "declaracao_saude",
    label: "Declaração de saúde",
    desc: "Informações sobre condições de saúde pré-existentes",
    obrigatorio: false,
  },
];

export function Step6Documentos({
  dados,
  planoEscolhido,
  cotacaoId,
  onVoltar,
  onConcluir,
}: Step6Props) {
  const [arquivos, setArquivos] = useState<Record<string, ArquivoUpload>>({});
  const [declaracaoSaude, setDeclaracaoSaude] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tipoAtivo, setTipoAtivo] = useState<string | null>(null);

  const abrirSeletor = (tipo: string) => {
    setTipoAtivo(tipo);
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tipoAtivo) return;

    const key = `${tipoAtivo}_${Date.now()}`;
    setArquivos((prev) => ({
      ...prev,
      [key]: { file, tipo: tipoAtivo, uploading: true, done: false, error: "" },
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", tipoAtivo);
      if (cotacaoId) formData.append("cotacaoId", cotacaoId);

      const res = await fetch("/api/documentos", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setArquivos((prev) => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, done: true },
      }));
    } catch (err) {
      setArquivos((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          uploading: false,
          done: false,
          error: "Erro ao enviar",
        },
      }));
    }

    e.target.value = "";
    setTipoAtivo(null);
  };

  const removerArquivo = (key: string) => {
    setArquivos((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const arquivosPorTipo = (tipo: string) =>
    Object.entries(arquivos).filter(([, v]) => v.tipo === tipo);

  const obrigatoriosConcluidos = DOCUMENTOS_NECESSARIOS.filter(
    (d) => d.obrigatorio
  ).every((d) => arquivosPorTipo(d.tipo).some(([, v]) => v.done));

  const handleEnviar = async () => {
    setEnviando(true);
    try {
      await fetch("/api/cotacao/finalizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cotacaoId, declaracaoSaude }),
      });
      setConcluido(true);
    } catch {
      alert("Erro ao finalizar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (concluido) {
    return (
      <div className="step-transition max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-brand-green-light flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-brand-green" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            Proposta enviada com sucesso!
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Um especialista da Meuplano.ai vai revisar sua proposta em até{" "}
            <strong>24 horas</strong> e te enviar o boleto por WhatsApp.
          </p>
        </div>
        <div className="p-5 bg-brand-green-light rounded-2xl text-left space-y-3">
          <div className="flex items-center gap-2 text-brand-green-dark font-semibold">
            <MessageCircle className="w-5 h-5" />
            O que acontece agora?
          </div>
          <ul className="space-y-2 text-sm text-brand-green-dark">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-green text-white text-xs flex items-center justify-center flex-shrink-0">1</span>
              Especialista analisa seus documentos
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-green text-white text-xs flex items-center justify-center flex-shrink-0">2</span>
              Proposta é transmitida para a operadora
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-green text-white text-xs flex items-center justify-center flex-shrink-0">3</span>
              Você recebe o boleto no WhatsApp
            </li>
          </ul>
        </div>
        <Button onClick={onConcluir} className="w-full" variant="green">
          Acompanhar minha proposta
        </Button>
      </div>
    );
  }

  return (
    <div className="step-transition max-w-xl mx-auto px-4 py-8 space-y-8">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleFileChange}
      />

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Documentos necessários
        </h1>
        <p className="text-gray-500 text-sm">
          Envie os documentos para {planoEscolhido.operadora.nome} processar sua
          proposta.
        </p>
      </div>

      <div className="space-y-4">
        {DOCUMENTOS_NECESSARIOS.map((doc) => {
          const arquivosTipo = arquivosPorTipo(doc.tipo);
          const temConcluido = arquivosTipo.some(([, v]) => v.done);

          return (
            <div
              key={doc.tipo}
              className={`p-4 rounded-2xl border-2 ${
                temConcluido
                  ? "border-brand-green bg-brand-green-light"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-semibold text-sm ${
                        temConcluido ? "text-brand-green-dark" : "text-gray-900"
                      }`}
                    >
                      {doc.label}
                    </p>
                    {doc.obrigatorio ? (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                        Obrigatório
                      </span>
                    ) : (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                        Opcional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{doc.desc}</p>

                  {/* Arquivos enviados */}
                  {arquivosTipo.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {arquivosTipo.map(([key, arq]) => (
                        <div
                          key={key}
                          className="flex items-center gap-2 text-xs"
                        >
                          {arq.uploading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-blue" />
                          ) : arq.done ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <span className="truncate text-gray-600 max-w-[160px]">
                            {arq.file.name}
                          </span>
                          {!arq.uploading && (
                            <button
                              onClick={() => removerArquivo(key)}
                              className="text-gray-300 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => abrirSeletor(doc.tipo)}
                  className={temConcluido ? "border-brand-green text-brand-green" : ""}
                >
                  <Upload className="w-4 h-4" />
                  {temConcluido ? "Adicionar" : "Enviar"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Declaração de saúde */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div
          onClick={() => setDeclaracaoSaude((v) => !v)}
          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${
            declaracaoSaude ? "bg-brand-blue border-brand-blue" : "border-gray-300"
          }`}
        >
          {declaracaoSaude && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="text-sm text-gray-600">
          Declaro que as informações prestadas são verídicas e autorizo o
          Meuplano.ai a transmitir minha proposta para a operadora.
        </span>
      </label>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 flex items-start gap-3">
        <MessageCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          Um especialista da Meuplano.ai vai revisar sua proposta em até 24h e
          te enviar o boleto por <strong>WhatsApp</strong>.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onVoltar} size="lg" className="flex-1">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Button>
        <Button
          onClick={handleEnviar}
          disabled={!obrigatoriosConcluidos || !declaracaoSaude || enviando}
          size="lg"
          className="flex-1"
          variant="green"
        >
          {enviando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Enviar proposta
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
