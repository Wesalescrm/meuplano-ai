/**
 * Agendador semanal de scraping.
 * Roda via node-cron — importar no servidor (não no edge runtime).
 */

import cron from "node-cron";
import { scraperPrecoOperadora } from "./scraper";
import { createServerClient } from "@/lib/supabase";

const OPERADORAS_PARA_SCRAPING = [
  "Amil Assistência Médica",
  "SulAmérica Saúde",
  "Bradesco Saúde",
  "Hapvida Saúde",
  "NotreDame Intermédica",
];

export function iniciarScheduler() {
  // Rodar toda segunda-feira às 3h da manhã
  cron.schedule("0 3 * * 1", async () => {
    console.log("[Scheduler] Iniciando atualização de preços...");
    await atualizarPrecos();
  });

  console.log("[Scheduler] Job de atualização de preços registrado.");
}

export async function atualizarPrecos() {
  const supabase = createServerClient();

  for (const operadora of OPERADORAS_PARA_SCRAPING) {
    try {
      console.log(`[Scraping] ${operadora}...`);
      const planos = await scraperPrecoOperadora(operadora);

      for (const plano of planos) {
        // Buscar operadora no banco
        const { data: op } = await supabase
          .from("operadoras")
          .select("id")
          .eq("nome", plano.operadora_nome)
          .maybeSingle();

        if (!op) continue;

        // Buscar plano no banco
        const { data: planoDb } = await supabase
          .from("planos")
          .select("id")
          .eq("nome", plano.plano_nome)
          .eq("operadora_id", op.id)
          .maybeSingle();

        if (!planoDb) continue;

        // Atualizar preços — desativar vigência atual e inserir novos
        await supabase
          .from("precos_por_faixa")
          .update({ vigencia_fim: new Date().toISOString().split("T")[0] })
          .eq("plano_id", planoDb.id)
          .is("vigencia_fim", null);

        const novosPrecos = plano.precos.map((p) => ({
          plano_id: planoDb.id,
          faixa_etaria_min: p.faixa_min,
          faixa_etaria_max: p.faixa_max,
          estado: p.estado,
          preco_mensal: p.preco,
          vigencia_inicio: new Date().toISOString().split("T")[0],
        }));

        await supabase.from("precos_por_faixa").insert(novosPrecos);
      }

      console.log(`[Scraping] ${operadora} — OK`);
    } catch (err) {
      console.error(`[Scraping] ${operadora} — ERRO:`, err);
    }

    // Delay entre operadoras
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log("[Scheduler] Atualização de preços concluída.");
}
