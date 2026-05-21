import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { recomendarPlanos, type PlanoComDados } from "@/lib/recomendador";
import type { DadosCotacao } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dados: DadosCotacao = body.dados;
    const sessionId: string | null = body.sessionId ?? null;

    if (!dados.beneficiarios || !dados.endereco) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const estado = dados.endereco.uf;

    // Buscar planos disponíveis no estado com preços
    const { data: planos, error: planosErr } = await supabase
      .from("planos")
      .select(
        `
        *,
        operadora:operadoras(*),
        precos:precos_por_faixa(*)
      `
      )
      .eq("ativo", true);

    if (planosErr) throw planosErr;
    if (!planos || planos.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Buscar rede credenciada para os planos relevantes
    const planoIds = planos.map((p) => p.id);
    const { data: redes } = await supabase
      .from("rede_credenciada")
      .select("plano_id, google_place_id, nome_hospital")
      .in("plano_id", planoIds)
      .eq("estado", estado);

    const redeMap: Record<
      string,
      { google_place_id: string | null; nome_hospital: string }[]
    > = {};
    for (const r of redes ?? []) {
      if (!redeMap[r.plano_id]) redeMap[r.plano_id] = [];
      redeMap[r.plano_id].push({
        google_place_id: r.google_place_id,
        nome_hospital: r.nome_hospital,
      });
    }

    const planosComDados: PlanoComDados[] = planos.map((p) => ({
      ...p,
      coberturas: Array.isArray(p.coberturas) ? p.coberturas : JSON.parse(p.coberturas ?? "[]"),
      carencias: typeof p.carencias === "object" ? p.carencias : JSON.parse(p.carencias ?? "{}"),
      rede: redeMap[p.id] ?? [],
    }));

    const recomendacoes = recomendarPlanos(dados, planosComDados);

    return NextResponse.json({ data: recomendacoes });
  } catch (err) {
    console.error("Erro na cotação:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar cotação" },
      { status: 500 }
    );
  }
}
