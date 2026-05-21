import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { StatusProposta } from "@/types";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();

  const { data: proposta, error } = await supabase
    .from("propostas")
    .select(
      `
      *,
      cotacao:cotacoes(
        *,
        plano_escolhido:planos(*, operadora:operadoras(*))
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !proposta) {
    return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
  }

  const { data: documentos } = await supabase
    .from("documentos")
    .select("*")
    .eq("cotacao_id", proposta.cotacao_id);

  return NextResponse.json({ data: { proposta, documentos: documentos ?? [] } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { status, observacoes } = await request.json();

  // Buscar proposta atual para histórico
  const { data: propostaAtual } = await supabase
    .from("propostas")
    .select("historico_status, status")
    .eq("id", params.id)
    .single();

  const historicoAtual = (propostaAtual?.historico_status as any[]) ?? [];
  const novoHistorico = [
    ...historicoAtual,
    {
      status,
      timestamp: new Date().toISOString(),
    },
  ];

  const { error } = await supabase
    .from("propostas")
    .update({
      status: status as StatusProposta,
      observacoes,
      historico_status: novoHistorico,
    })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notificar cliente se status relevante
  if (
    ["transmitida", "boleto_enviado", "contratada"].includes(status)
  ) {
    notificarCliente(params.id, status).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}

async function notificarCliente(propostaId: string, status: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("propostas")
    .select("cotacao:cotacoes(dados_cotacao)")
    .eq("id", propostaId)
    .single();

  const telefone = (data as any)?.cotacao?.dados_cotacao?.telefone;
  if (!telefone) return;

  const mensagens: Record<string, string> = {
    transmitida:
      "Sua proposta foi transmitida para a operadora! Em breve você receberá o boleto.",
    boleto_enviado:
      "Seu boleto foi enviado! Verifique o e-mail ou acesse o link enviado.",
    contratada: "Parabéns! Seu plano de saúde foi contratado com sucesso!",
  };

  const mensagem = mensagens[status];
  if (!mensagem) return;

  const whatsappUrl = process.env.WHATSAPP_API_URL;
  const whatsappKey = process.env.WHATSAPP_API_KEY;
  if (!whatsappUrl || !whatsappKey) return;

  // Estrutura genérica para Evolution API
  await fetch(`${whatsappUrl}/message/sendText/meuplano`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: whatsappKey,
    },
    body: JSON.stringify({
      number: telefone.replace(/\D/g, ""),
      textMessage: { text: `*Meuplano.ai*\n\n${mensagem}` },
    }),
  }).catch(console.error);
}
