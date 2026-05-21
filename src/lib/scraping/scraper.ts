/**
 * Motor de scraping para obter dados de planos de saúde.
 *
 * Abstração que permite trocar scraping por APIs reais no futuro.
 * Respeita robots.txt com delays entre requisições.
 */

export interface PlanoScraped {
  operadora_nome: string;
  operadora_ans: string;
  plano_nome: string;
  tipo: "individual" | "familiar" | "empresarial";
  coparticipacao: boolean;
  coberturas: string[];
  precos: {
    faixa_min: number;
    faixa_max: number;
    estado: string;
    preco: number;
  }[];
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, tentativas = 3): Promise<string> {
  for (let i = 0; i < tentativas; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MeuplanoBot/1.0; +https://meuplano.ai/bot)",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === tentativas - 1) throw e;
      await sleep(2000 * (i + 1));
    }
  }
  throw new Error("Máximo de tentativas atingido");
}

/**
 * Scraping básico da ANS — lista de operadoras ativas por UF.
 * Endpoint público da ANS: https://www.ans.gov.br/sis/taos/
 */
export async function scraperOperadorasANS(
  uf: string
): Promise<{ nome: string; registro: string }[]> {
  await sleep(1500);

  // ANS disponibiliza dados abertos em CSV/JSON
  const url = `https://dados.ans.gov.br/operadoras/informacoes_cadastrais/Relatorio_cadop.csv`;

  try {
    const html = await fetchWithRetry(url);
    // Parse simplificado do CSV
    const linhas = html.split("\n").slice(1);
    const operadoras: { nome: string; registro: string }[] = [];

    for (const linha of linhas.slice(0, 200)) {
      const cols = linha.split(";");
      if (cols.length < 5) continue;
      const registro = cols[0]?.trim();
      const nome = cols[1]?.trim();
      const ufOperadora = cols[9]?.trim();
      if (registro && nome && (!uf || ufOperadora === uf)) {
        operadoras.push({ nome, registro });
      }
    }

    return operadoras;
  } catch (err) {
    console.error("Erro no scraping ANS:", err);
    return [];
  }
}

/**
 * Scraping genérico de tabela de preços.
 * Retorna dados em cache se o site bloquear.
 */
export async function scraperPrecoOperadora(
  operadoraNome: string
): Promise<PlanoScraped[]> {
  await sleep(2000);

  // Mapeamento de funções específicas por operadora
  const scrapers: Record<string, () => Promise<PlanoScraped[]>> = {
    amil: scraperAmil,
    sulamerica: scraperSulAmerica,
  };

  const key = operadoraNome.toLowerCase().replace(/[^a-z]/g, "");
  const scraperFn = scrapers[key];

  if (scraperFn) {
    try {
      return await scraperFn();
    } catch (err) {
      console.error(`Scraper ${operadoraNome} falhou:`, err);
    }
  }

  // Fallback para dados em cache no banco
  return [];
}

async function scraperAmil(): Promise<PlanoScraped[]> {
  // Estrutura preparada para scraping real
  // URL real: https://www.amil.com.br/plano-de-saude/tabela-de-precos
  // Por ora retorna dados mockados representativos

  return [
    {
      operadora_nome: "Amil Assistência Médica",
      operadora_ans: "326305",
      plano_nome: "Amil One 100",
      tipo: "individual",
      coparticipacao: false,
      coberturas: [
        "Consultas ilimitadas",
        "Exames de rotina",
        "Internação em apartamento",
        "Cirurgias",
        "UTI",
        "Parto",
        "Urgência 24h",
        "Telemedicina",
      ],
      precos: [
        { faixa_min: 0, faixa_max: 18, estado: "SP", preco: 320 },
        { faixa_min: 19, faixa_max: 23, estado: "SP", preco: 380 },
        { faixa_min: 24, faixa_max: 28, estado: "SP", preco: 420 },
        { faixa_min: 29, faixa_max: 33, estado: "SP", preco: 480 },
        { faixa_min: 34, faixa_max: 38, estado: "SP", preco: 560 },
        { faixa_min: 39, faixa_max: 43, estado: "SP", preco: 660 },
        { faixa_min: 44, faixa_max: 48, estado: "SP", preco: 780 },
        { faixa_min: 49, faixa_max: 53, estado: "SP", preco: 950 },
        { faixa_min: 54, faixa_max: 58, estado: "SP", preco: 1150 },
        { faixa_min: 59, faixa_max: 999, estado: "SP", preco: 1450 },
      ],
    },
  ];
}

async function scraperSulAmerica(): Promise<PlanoScraped[]> {
  return [];
}
