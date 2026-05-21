/**
 * Script de seed: insere dados iniciais no Supabase.
 * Executar: npx tsx scripts/seed.ts
 *
 * Requisito: variáveis de ambiente configuradas no .env
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log("🌱 Iniciando seed...");

  // Verificar se já há operadoras
  const { count } = await supabase
    .from("operadoras")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    console.log("✅ Seed já executado anteriormente. Pulando.");
    return;
  }

  console.log("📋 Inserindo operadoras...");
  const { error: opErr } = await supabase.from("operadoras").insert([
    {
      id: "11111111-1111-1111-1111-111111111111",
      nome: "Amil Assistência Médica",
      ans_registro: "326305",
      site: "https://www.amil.com.br",
      ativa: true,
      estados: ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "PE", "CE", "GO", "DF"],
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      nome: "SulAmérica Saúde",
      ans_registro: "005711",
      site: "https://portal.sulamerica.com.br",
      ativa: true,
      estados: ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "PE", "CE", "GO", "DF"],
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      nome: "Bradesco Saúde",
      ans_registro: "005932",
      site: "https://www.bradescosaude.com.br",
      ativa: true,
      estados: ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "PE", "CE", "GO", "DF", "AM", "PA"],
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      nome: "Hapvida Saúde",
      ans_registro: "368253",
      site: "https://www.hapvida.com.br",
      ativa: true,
      estados: ["CE", "PE", "BA", "MA", "PI", "RN", "PB", "AL", "SE", "GO", "DF", "MG", "SP"],
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      nome: "NotreDame Intermédica",
      ans_registro: "359017",
      site: "https://www.gndi.com.br",
      ativa: true,
      estados: ["SP", "RJ", "MG", "RS", "PR", "SC", "GO", "DF"],
    },
  ]);

  if (opErr) {
    console.error("❌ Erro ao inserir operadoras:", opErr.message);
    process.exit(1);
  }

  console.log("✅ Operadoras inseridas com sucesso!");
  console.log("");
  console.log("📝 Para completar o seed de planos, execute o arquivo:");
  console.log("   supabase/migrations/002_seed_planos.sql");
  console.log("   no painel SQL do Supabase.");
  console.log("");
  console.log("🎉 Seed concluído!");
}

seed().catch(console.error);
