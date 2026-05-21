import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("propostas")
    .select(
      `
      id,
      status,
      observacoes,
      created_at,
      updated_at,
      cotacao:cotacoes(
        id,
        valor_mensal,
        dados_cotacao,
        plano_escolhido:planos(
          id,
          nome,
          operadora:operadoras(nome)
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
