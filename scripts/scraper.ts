/**
 * Script de scraping manual: atualiza preços de planos no Supabase.
 * Executar: npx tsx scripts/scraper.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Importar e rodar atualização
async function main() {
  console.log("🤖 Iniciando scraping de preços...");

  // Import dinâmico para compatibilidade com ESM
  const { atualizarPrecos } = await import("../src/lib/scraping/scheduler");
  await atualizarPrecos();

  console.log("✅ Scraping concluído!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro no scraping:", err);
  process.exit(1);
});
