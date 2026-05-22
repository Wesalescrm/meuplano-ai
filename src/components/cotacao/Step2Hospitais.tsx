"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, MapPin, CheckCircle2,
  Loader2, Building2, Stethoscope,
} from "lucide-react";
import type { DadosCotacao, HospitalPreferido, PlacesResult } from "@/types";

interface Step2Props {
  dados: DadosCotacao;
  onAtualizar: (dados: Partial<DadosCotacao>) => void;
  onProximo: () => void;
  onVoltar: () => void;
}

function isHospital(p: PlacesResult) {
  return p.types?.includes("hospital");
}

function CardEstabelecimento({
  place,
  selecionado,
  onToggle,
}: {
  place: PlacesResult;
  selecionado: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
        selecionado
          ? "border-brand-blue bg-brand-blue-light"
          : "border-gray-100 bg-white hover:border-brand-blue/30"
      }`}
    >
      {place.photo_url ? (
        <img
          src={place.photo_url}
          alt={place.name}
          className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          {isHospital(place) ? (
            <Building2 className="w-5 h-5 text-gray-400" />
          ) : (
            <Stethoscope className="w-5 h-5 text-gray-400" />
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${selecionado ? "text-brand-blue" : "text-gray-900"}`}>
          {place.name}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{place.vicinity}</span>
        </div>
        {place.distance_km !== undefined && (
          <span className="text-xs text-brand-blue font-medium">
            {place.distance_km.toFixed(1)} km
          </span>
        )}
      </div>
      <CheckCircle2
        className={`w-5 h-5 flex-shrink-0 transition-colors ${
          selecionado ? "text-brand-blue" : "text-gray-200"
        }`}
      />
    </button>
  );
}

export function Step2Hospitais({ dados, onAtualizar, onProximo, onVoltar }: Step2Props) {
  const [todos, setTodos] = useState<PlacesResult[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(
    new Set(dados.hospitais_preferidos?.map((h) => h.place_id) ?? [])
  );
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

  const hospitais = todos.filter(isHospital);
  const clinicas = todos.filter((p) => !isHospital(p));

  const handleProximo = () => {
    const preferidos: HospitalPreferido[] = todos
      .filter((h) => selecionados.has(h.place_id))
      .map((h) => ({
        place_id: h.place_id,
        nome: h.name,
        endereco: h.vicinity,
        distancia_km: h.distance_km,
        foto_url: h.photo_url,
        tipo: h.types?.[0],
      }));
    onAtualizar({ hospitais_preferidos: preferidos });
    onProximo();
  };

  return (
    <div className="step-transition max-w-xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Onde você prefere ser atendido?
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Marque os hospitais e clínicas privadas que você usa ou prefere.
          Só recomendamos planos que os cobrem.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          <p className="text-sm">Buscando estabelecimentos privados próximos…</p>
        </div>
      )}

      {erro && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {erro}
        </div>
      )}

      {!loading && !erro && (
        <div className="space-y-6">
          {/* Hospitais */}
          {hospitais.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-blue" />
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Hospitais
                </h2>
              </div>
              <div className="space-y-2">
                {hospitais.map((h) => (
                  <CardEstabelecimento
                    key={h.place_id}
                    place={h}
                    selecionado={selecionados.has(h.place_id)}
                    onToggle={() => toggle(h)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Clínicas e laboratórios */}
          {clinicas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-brand-blue" />
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Clínicas e Laboratórios
                </h2>
              </div>
              <div className="space-y-2">
                {clinicas.map((c) => (
                  <CardEstabelecimento
                    key={c.place_id}
                    place={c}
                    selecionado={selecionados.has(c.place_id)}
                    onToggle={() => toggle(c)}
                  />
                ))}
              </div>
            </div>
          )}

          {hospitais.length === 0 && clinicas.length === 0 && (
            <div className="p-6 text-center text-gray-400">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum estabelecimento privado encontrado próximo ao seu CEP.</p>
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
