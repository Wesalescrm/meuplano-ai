import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { cotacaoId, declaracaoSaude } = await request.json();

    if (!cotacaoId) {
      return NextResponse.json({ error: "cotacaoId obrigatório" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Atualizar status da cotação
    const { error: cotacaoErr } = await supabase
      .from("cotacoes")
      .update({ status: "documentos_enviados" })
      .eq("id", cotacaoId);

    if (cotacaoErr) throw cotacaoErr;

    // Criar proposta (se não existir via trigger)
    const { data: propostaExistente } = await supabase
      .from("propostas")
      .select("id")
      .eq("cotacao_id", cotacaoId)
      .maybeSingle();

    if (!propostaExistente) {
      await supabase.from("propostas").insert({
        cotacao_id: cotacaoId,
        status: "aguardando_revisao",
      });
    } else {
      await supabase
        .from("propostas")
        .update({ status: "aguardando_revisao" })
        .eq("cotacao_id", cotacaoId);
    }

    // Notificar operadores via WhatsApp (sem bloquear)
    notificarOperadores(cotacaoId).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao finalizar cotação:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

async function notificarOperadores(cotacaoId: string) {
  const whatsappUrl = process.env.WHATSAPP_API_URL;
  const whatsappKey = process.env.WHATSAPP_API_KEY;
  if (!whatsappUrl || !whatsappKey) return;

  const supabase = createServerClient();
  const { data: operadores } = await supabase
    .from("operadores")
    .select("email")
    .eq("ativo", true)
    .eq("role", "operador");

  // Notificar via Evolution API (estrutura genérica)
  const mensagem = `Nova proposta recebida!\nCotação: ${cotacaoId}\nAcesse o painel para revisar.`;
  console.log("Notificando operadores:", mensagem);
}
