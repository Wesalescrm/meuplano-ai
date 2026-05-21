import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email, telefone, planoId, valorMensal, score, dados } =
      await request.json();

    const supabase = createServerClient();

    // Criar ou buscar usuário pelo email
    let userId: string | null = null;
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Criar conta via Supabase Auth
      const { data: authData } = await supabase.auth.admin.createUser({
        email,
        phone: telefone,
        email_confirm: true,
        user_metadata: { phone: telefone },
      });

      if (authData.user) {
        userId = authData.user.id;
        await supabase.from("users").upsert({
          id: userId,
          email,
          phone: telefone,
        });
      }
    }

    // Criar/atualizar cotação
    const cotacaoData = {
      session_id: sessionId,
      user_id: userId,
      plano_escolhido_id: planoId,
      dados_cotacao: dados,
      status: "plano_escolhido" as const,
      valor_mensal: valorMensal,
      score_compatibilidade: score,
    };

    const { data: cotacao, error } = await supabase
      .from("cotacoes")
      .insert(cotacaoData)
      .select()
      .single();

    if (error) throw error;

    // Vincular sessão ao usuário
    if (sessionId && userId) {
      await supabase
        .from("sessions")
        .update({ user_id: userId })
        .eq("id", sessionId);
    }

    // Enviar e-mail com link para a cotação (sem bloquear)
    sendWelcomeEmail(email, cotacao.id).catch(console.error);

    return NextResponse.json({ cotacaoId: cotacao.id });
  } catch (err) {
    console.error("Erro ao salvar cotação:", err);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

async function sendWelcomeEmail(email: string, cotacaoId: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://meuplano.ai";
  if (!resendKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "noreply@meuplano.ai",
      to: email,
      subject: "Sua cotação no Meuplano.ai está pronta!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0057FF;">Sua cotação foi salva!</h2>
          <p>Acesse o link abaixo para ver e acompanhar sua cotação:</p>
          <a href="${appUrl}/conta/cotacoes/${cotacaoId}"
             style="display: inline-block; background: #0057FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Ver minha cotação
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            Um especialista da Meuplano.ai entrará em contato em breve.
          </p>
        </div>
      `,
    }),
  });
}
