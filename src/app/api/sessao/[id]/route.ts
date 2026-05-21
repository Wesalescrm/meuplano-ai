import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = createServerClient();

    const { error } = await supabase
      .from("sessions")
      .update({
        dados_parciais: body.dados_parciais,
        etapa_atual: body.etapa_atual,
      })
      .eq("id", params.id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar sessão" }, { status: 500 });
  }
}
