"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, MapPin, CheckCircle2,
  Loader2, Building2, Stethoscope, Star,
} from "lucide-react";
import type { DadosCotacao, HospitalPreferido, PlacesResult } from "@/types";

interface Step2Props {
  dados: DadosCotacao;
  onAtualizar: (dados: Partial<DadosCotacao>) => void;
  onProximo: () => void;
  onVoltar: () => void;
  modo: "hospitais" | "clinicas";
}

function isHospital(p: PlacesResult) {
  return p.types?.includes("hospital");
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  return (
    <div className="flex items-center gap-0.5 mt-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3 h-3 ${
            n <= full
              ? "text-amber-400 fill-amber-400"
              : n === full + 1 && half
              ? "text-amber-400 fill-amber-200"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

function CardEstabelecimento({
  place,
  selecionado,
  onToggle,
  tipo,
}: {
  place: PlacesResult;
  selecionado: boolean;
  onToggle: () => void;
  tipo: "hospital" | "clinica";
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
        selecionado
          ? "border-brand-blue bg-brand-blue-light shadow-sm"
          : "border-gray-100 bg-white hover:border-brand-blue/40 hover:shadow-sm"
      }`}
    >
      {/* Ícone */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
        selecionado ? "bg-brand-blue/10" : "bg-gray-100"
      }`}>
        {tipo === "hospital" ? (
          <Building2 className={`w-4 h-4 ${selecionado ? "text-brand-blue" : "text-gray-400"}`} />
        ) : (
          <Stethoscope className={`w-4 h-4 ${selecionado ? "text-brand-blue" : "text-gray-400"}`} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm leading-snug ${selecionado ? "text-brand-blue" : "text-gray-900"}`}>
          {place.name}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{place.vicinity}</span>
        </div>
        {place.distance_km !== undefined && (
          <p className="text-xs text-brand-blue font-medium mt-0.5">
            {place.distance_km.toFixed(1)} km de você
          </p>
        )}
        {place.rating !== undefined && <StarRating rating={place.rating} />}
      </div>

      {/* Check */}
      <CheckCircle2
        className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-colors ${
          selecionado ? "text-brand-blue" : "text-gray-200"
        }`}
      />
    </button>
  );
}

export function Step2Hospitais({ dados, onAtualizar, onProximo, onVoltar, modo }: Step2Props) {
  const [todos, setTodos] = useState<PlacesResult[]>([]);

  const chaveSelecao = modo === "hospitais" ? "hospitais_preferidos" : "clinicas_preferidas";
  const selecionadosIniciais = (dados[chaveSelecao] ?? []).map((h) => h.place_id);

  const [selecionados, setSelecionados] = useState<Set<string>>(new Set(selecionadosIniciais));
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const cep = dados.cep;
    if (!cep) return;
    const buscar = async () => {
      setLoading(true);
      setErro("");
      try {
        const res = await fetch(`/api/places?cep=${cep}`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setTodos(json.data ?? []);
      } catch {
        setErro("Não foi possível carregar os estabelecimentos próximos.");
      } finally {
        setLoading(false);
      }
    };
    buscar();
  }, [dados.cep]);

  const toggle = (place: PlacesResult) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      next.has(place.place_id) ? next.delete(place.place_id) : next.add(place.place_id);
      return next;
    });
  };

  const itens = modo === "hospitais"
    ? todos.filter(isHospital)
    : todos.filter((p) => !isHospital(p));

  const handleProximo = () => {
    const preferidos: HospitalPreferido[] = todos
      .filter((h) => selecionados.has(h.place_id))
      .filter((h) => modo === "hospitais" ? isHospital(h) : !isHospital(h))
      .map((h) => ({
        place_id: h.place_id,
        nome: h.name,
        endereco: h.vicinity,
        distancia_km: h.distance_km,
        tipo: h.types?.[0],
      }));
    onAtualizar({ [chaveSelecao]: preferidos });
    onProximo();
  };

  const titulo = modo === "hospitais"
    ? "Quais hospitais você prefere?"
    : "Quais clínicas e laboratórios você usa?";
  const subtitulo = modo === "hospitais"
    ? "Marque os hospitais privados próximos a você. Só recomendamos planos que os cobrem."
    : "Marque as clínicas e laboratórios que você costuma usar para exames e consultas.";
  const icone = modo === "hospitais" ? (
    <Building2 className="w-4 h-4 text-brand-blue" />
  ) : (
    <Stethoscope className="w-4 h-4 text-brand-blue" />
  );
  const secao = modo === "hospitais" ? "HOSPITAIS" : "CLÍNICAS E LABORATÓRIOS";
  const vazioMsg = modo === "hospitais"
    ? "Nenhum hospital privado encontrado próximo ao seu CEP."
    : "Nenhuma clínica encontrada próxima ao seu CEP.";

  return (
    <div className="step-transition max-w-xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{titulo}</h1>
        <p className="text-gray-500 text-sm leading-relaxed">{subtitulo}</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          <p className="text-sm">Buscando estabelecimentos próximos…</p>
        </div>
      )}

      {erro && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {erro}
        </div>
      )}

      {!loading && !erro && (
        <div className="space-y-4">
          {itens.length > 0 ? (
            <>
              <div className="flex items-center gap-2">
                {icone}
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  {secao}
                </h2>
              </div>
              <div className="space-y-2">
                {itens.map((item) => (
                  <CardEstabelecimento
                    key={item.place_id}
                    place={item}
                    selecionado={selecionados.has(item.place_id)}
                    onToggle={() => toggle(item)}
                    tipo={modo === "hospitais" ? "hospital" : "clinica"}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-400">
              {modo === "hospitais" ? (
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
              ) : (
                <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-40" />
              )}
              <p className="text-sm">{vazioMsg}</p>
              <p className="text-xs mt-1">Você pode continuar sem selecionar.</p>
            </div>
          )}
        </div>
      )}

      {selecionados.size > 0 && (
        <div className="px-4 py-3 bg-brand-green-light rounded-xl text-sm text-brand-green-dark font-medium">
          {selecionados.size} {selecionados.size === 1 ? "local selecionado" : "locais selecionados"}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onVoltar} size="lg" className="flex-1">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Button>
        <Button onClick={handleProximo} size="lg" className="flex-1">
          Continuar
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
