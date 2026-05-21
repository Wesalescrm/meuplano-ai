"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatarMoeda } from "@/lib/utils";
import {
  Loader2,
  LogOut,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  Send,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import type { StatusProposta } from "@/types";

interface PropostaResumo {
  id: string;
  status: StatusProposta;
  created_at: string;
  updated_at: string;
  cotacao: {
    id: string;
    valor_mensal: number | null;
    dados_cotacao: {
      email?: string;
      telefone?: string;
      beneficiarios?: { idade: number }[];
      endereco?: { localidade: string; uf: string };
    };
    plano_escolhido: {
      nome: string;
      operadora: { nome: string };
    } | null;
  };
}

const STATUS_CONFIG: Record<
  StatusProposta,
  { label: string; cor: string; icon: React.ReactNode }
> = {
  aguardando_revisao: {
    label: "Aguardando revisão",
    cor: "bg-yellow-100 text-yellow-700",
    icon: <Clock className="w-3 h-3" />,
  },
  em_analise: {
    label: "Em análise",
    cor: "bg-blue-100 text-blue-700",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  documentos_solicitados: {
    label: "Docs solicitados",
    cor: "bg-orange-100 text-orange-700",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  transmitida: {
    label: "Transmitida",
    cor: "bg-brand-blue-light text-brand-blue",
    icon: <Send className="w-3 h-3" />,
  },
  boleto_enviado: {
    label: "Boleto enviado",
    cor: "bg-purple-100 text-purple-700",
    icon: <Send className="w-3 h-3" />,
  },
  contratada: {
    label: "Contratada",
    cor: "bg-brand-green-light text-brand-green-dark",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  recusada: {
    label: "Recusada",
    cor: "bg-red-100 text-red-700",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const FILTROS: { valor: string; label: string }[] = [
  { valor: "todos", label: "Todas" },
  { valor: "aguardando_revisao", label: "Aguardando" },
  { valor: "em_analise", label: "Em análise" },
  { valor: "transmitida", label: "Transmitidas" },
  { valor: "contratada", label: "Contratadas" },
];

export default function PainelPage() {
  const router = useRouter();
  const [propostas, setPropostas] = useState<PropostaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const checarAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/painel/login");
        return;
      }
      buscarPropostas();
    };
    checarAuth();
  }, []);

  const buscarPropostas = async () => {
    setLoading(true);
    const res = await fetch("/api/painel/propostas");
    const json = await res.json();
    setPropostas(json.data ?? []);
    setLoading(false);
  };

  const propostasFiltradas = propostas.filter((p) => {
    const matchFiltro = filtro === "todos" || p.status === filtro;
    const matchBusca =
      !busca ||
      p.cotacao.dados_cotacao?.email
        ?.toLowerCase()
        .includes(busca.toLowerCase()) ||
      p.cotacao.plano_escolhido?.nome
        .toLowerCase()
        .includes(busca.toLowerCase());
    return matchFiltro && matchBusca;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/painel/login");
  };

  // Contadores por status
  const contadores = propostas.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-gray-900">
              Meuplano<span className="text-gradient">.ai</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-500">
              Painel do Operador
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", valor: propostas.length, cor: "text-gray-900" },
            {
              label: "Aguardando",
              valor: contadores["aguardando_revisao"] ?? 0,
              cor: "text-yellow-600",
            },
            {
              label: "Em análise",
              valor: contadores["em_analise"] ?? 0,
              cor: "text-brand-blue",
            },
            {
              label: "Contratadas",
              valor: contadores["contratada"] ?? 0,
              cor: "text-brand-green",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 p-4"
            >
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className={`text-3xl font-extrabold ${stat.cor}`}>
                {stat.valor}
              </p>
            </div>
          ))}
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por e-mail ou plano..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTROS.map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filtro === f.valor
                    ? "bg-brand-blue text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-brand-blue/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de propostas */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        ) : propostasFiltradas.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Nenhuma proposta encontrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {propostasFiltradas.map((proposta) => {
              const config = STATUS_CONFIG[proposta.status];
              const cotacao = proposta.cotacao;
              return (
                <div
                  key={proposta.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-brand-blue/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.cor}`}
                        >
                          {config.icon}
                          {config.label}
                        </div>
                        <span className="text-xs text-gray-400 font-mono">
                          #{proposta.id.slice(0, 8)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Cliente</p>
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {cotacao.dados_cotacao?.email ?? "Sem e-mail"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">WhatsApp</p>
                          <p className="text-sm text-gray-700">
                            {cotacao.dados_cotacao?.telefone ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Plano</p>
                          <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                            {cotacao.plano_escolhido
                              ? `${cotacao.plano_escolhido.operadora.nome} — ${cotacao.plano_escolhido.nome}`
                              : "—"}
                          </p>
                        </div>
                        {cotacao.valor_mensal && (
                          <div>
                            <p className="text-xs text-gray-400">Mensalidade</p>
                            <p className="text-sm font-bold text-brand-blue">
                              {formatarMoeda(cotacao.valor_mensal)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-400">Localidade</p>
                          <p className="text-sm text-gray-600">
                            {cotacao.dados_cotacao?.endereco
                              ? `${cotacao.dados_cotacao.endereco.localidade}/${cotacao.dados_cotacao.endereco.uf}`
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400">
                        Recebida em{" "}
                        {new Date(proposta.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <Link href={`/painel/propostas/${proposta.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
