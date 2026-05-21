import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("sessions")
      .insert({ dados_parciais: {}, etapa_atual: 1 })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: "Erro ao criar sessão" }, { status: 500 });
  }
}
