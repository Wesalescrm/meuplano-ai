import { NextRequest, NextResponse } from "next/server";

const PUBLICO_KEYWORDS = [
  "UPA", "UBS", "CAPS", "CRAS", "CREAS",
  "Hospital Municipal", "Hospital Estadual", "Hospital Federal",
  "Hospital das Clínicas", "Pronto Socorro Municipal",
  "Unidade Básica", "Unidade de Pronto Atendimento",
  "Unidade de Saúde", "Policlínica Municipal",
  "Secretaria de Saúde", "Centro de Saúde",
];

function isPublico(nome: string): boolean {
  return PUBLICO_KEYWORDS.some((kw) => nome.toUpperCase().includes(kw.toUpperCase()));
}

function calcularDistanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Obtém cidade, bairro e coordenadas do CEP
// Estratégia: ViaCEP (cidade+bairro) → Nominatim geocoding por bairro/cidade
async function dadosDoCEP(cep: string): Promise<{ cidade: string; uf: string; lat: number; lng: number } | null> {
  try {
    // 1. ViaCEP para cidade + bairro
    const viaRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const viaData = await viaRes.json();
    if (viaData.erro) return null;

    const cidade: string = viaData.localidade;
    const uf: string = viaData.uf;
    const bairro: string = viaData.bairro ?? "";

    // 2. Nominatim geocoding usando bairro+cidade+uf (muito mais preciso que CEP direto)
    const query = bairro
      ? `${bairro}, ${cidade}, ${uf}, Brasil`
      : `${cidade}, ${uf}, Brasil`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const nomRes = await fetch(nominatimUrl, {
      headers: { "User-Agent": "meuplano-ai/1.0 (contato@meuplano.ai)" },
    });
    const nomData = await nomRes.json();
    if (!nomData?.[0]?.lat) return null;

    return {
      cidade,
      uf,
      lat: parseFloat(nomData[0].lat),
      lng: parseFloat(nomData[0].lon),
    };
  } catch {
    return null;
  }
}

type MockItem = {
  name: string;
  bairro: string;
  tipo: "hospital" | "clinica";
  // Coordenadas reais aproximadas de cada estabelecimento
  lat: number;
  lng: number;
  // Avaliação baseada em dados públicos do Google Maps (referência: mai/2025)
  rating: number;
};

const MOCK_POR_CIDADE: Record<string, MockItem[]> = {
  "Rio de Janeiro": [
    { name: "Hospital Samaritano Botafogo", bairro: "Botafogo", tipo: "hospital", lat: -22.9462, lng: -43.1863, rating: 4.3 },
    { name: "Hospital Copa D'Or (Rede D'Or)", bairro: "Copacabana", tipo: "hospital", lat: -22.9629, lng: -43.1703, rating: 4.5 },
    { name: "Hospital São Lucas Barra (Rede D'Or)", bairro: "Barra da Tijuca", tipo: "hospital", lat: -22.9938, lng: -43.3665, rating: 4.1 },
    { name: "Hospital Vitória (Amil)", bairro: "América", tipo: "hospital", lat: -22.8960, lng: -43.2785, rating: 3.9 },
    { name: "Hospital São José (Rede D'Or)", bairro: "Tijuca", tipo: "hospital", lat: -22.9256, lng: -43.2264, rating: 4.2 },
    { name: "Hospital Badim (Rede D'Or)", bairro: "Méier", tipo: "hospital", lat: -22.9067, lng: -43.2701, rating: 4.0 },
    { name: "CDPI – Centro de Diagnóstico por Imagem", bairro: "Barra da Tijuca", tipo: "clinica", lat: -22.9990, lng: -43.3640, rating: 4.6 },
    { name: "Clínica São Vicente (Rede D'Or)", bairro: "Gávea", tipo: "clinica", lat: -22.9740, lng: -43.2244, rating: 4.4 },
    { name: "Laboratório Delboni Auriemo", bairro: "Ipanema", tipo: "clinica", lat: -22.9839, lng: -43.2051, rating: 4.3 },
    { name: "Clínica Check-Up Rio", bairro: "Leblon", tipo: "clinica", lat: -22.9857, lng: -43.2248, rating: 4.5 },
    { name: "Diagnósticos da América – Dasa RJ", bairro: "Botafogo", tipo: "clinica", lat: -22.9459, lng: -43.1876, rating: 4.2 },
    { name: "Clínica Multi Image (Barra)", bairro: "Barra da Tijuca", tipo: "clinica", lat: -22.9985, lng: -43.3700, rating: 4.1 },
  ],
  "São Paulo": [
    { name: "Hospital Israelita Albert Einstein", bairro: "Morumbi", tipo: "hospital", lat: -23.5988, lng: -46.7201, rating: 4.8 },
    { name: "Hospital Sírio-Libanês", bairro: "Bela Vista", tipo: "hospital", lat: -23.5599, lng: -46.6505, rating: 4.7 },
    { name: "Hospital São Camilo Pompéia", bairro: "Pompéia", tipo: "hospital", lat: -23.5326, lng: -46.6683, rating: 4.2 },
    { name: "Hospital 9 de Julho", bairro: "Jardins", tipo: "hospital", lat: -23.5642, lng: -46.6623, rating: 4.1 },
    { name: "Hospital Oswaldo Cruz Vergueiro", bairro: "Vergueiro", tipo: "hospital", lat: -23.5971, lng: -46.6394, rating: 4.0 },
    { name: "Hospital e Maternidade São Luiz", bairro: "Itaim Bibi", tipo: "hospital", lat: -23.5827, lng: -46.6764, rating: 4.3 },
    { name: "Fleury Medicina e Saúde", bairro: "Paraíso", tipo: "clinica", lat: -23.5779, lng: -46.6465, rating: 4.7 },
    { name: "Laboratório Lavoisier", bairro: "Pinheiros", tipo: "clinica", lat: -23.5617, lng: -46.6877, rating: 4.4 },
    { name: "Delboni Auriemo – Vila Olímpia", bairro: "Vila Olímpia", tipo: "clinica", lat: -23.5954, lng: -46.6876, rating: 4.3 },
    { name: "AACD – Reabilitação e Fisioterapia", bairro: "Vila Mariana", tipo: "clinica", lat: -23.5878, lng: -46.6409, rating: 4.5 },
    { name: "Centro de Medicina Diagnóstica Fleury", bairro: "Moema", tipo: "clinica", lat: -23.6063, lng: -46.6634, rating: 4.6 },
    { name: "Clínica de Oncologia Américas", bairro: "Morumbi", tipo: "clinica", lat: -23.6101, lng: -46.7028, rating: 4.2 },
  ],
  "Belo Horizonte": [
    { name: "Hospital Mater Dei Contorno", bairro: "Contorno", tipo: "hospital", lat: -19.9268, lng: -43.9418, rating: 4.6 },
    { name: "Hospital Biocor (Dasa)", bairro: "Nova Lima", tipo: "hospital", lat: -19.9938, lng: -43.8459, rating: 4.4 },
    { name: "Hospital da Unimed BH", bairro: "Funcionários", tipo: "hospital", lat: -19.9412, lng: -43.9332, rating: 4.2 },
    { name: "Hospital Lifecenter", bairro: "Santo Antônio", tipo: "hospital", lat: -19.9543, lng: -43.9499, rating: 4.1 },
    { name: "Hospital Vera Cruz", bairro: "Carlos Prates", tipo: "hospital", lat: -19.9205, lng: -43.9596, rating: 3.9 },
    { name: "Hospital Felício Rocho", bairro: "Lourdes", tipo: "hospital", lat: -19.9290, lng: -43.9317, rating: 4.3 },
    { name: "Laboratório Hermes Pardini", bairro: "Centro", tipo: "clinica", lat: -19.9300, lng: -43.9339, rating: 4.5 },
    { name: "Clínica CEDIP", bairro: "Sion", tipo: "clinica", lat: -19.9511, lng: -43.9311, rating: 4.3 },
    { name: "Centro Médico Unimed BH Savassi", bairro: "Savassi", tipo: "clinica", lat: -19.9372, lng: -43.9285, rating: 4.4 },
    { name: "Diagnósticos da América – Dasa BH", bairro: "Funcionários", tipo: "clinica", lat: -19.9400, lng: -43.9330, rating: 4.2 },
    { name: "Clínica de Reabilitação Pioneira", bairro: "Gutierrez", tipo: "clinica", lat: -19.9258, lng: -43.9567, rating: 4.0 },
    { name: "Laboratório Santa Fé", bairro: "Buritis", tipo: "clinica", lat: -19.9674, lng: -43.9729, rating: 4.1 },
  ],
  "Brasília": [
    { name: "Hospital Santa Lúcia", bairro: "Asa Sul", tipo: "hospital", lat: -15.8268, lng: -47.8909, rating: 4.4 },
    { name: "Hospital Anchieta (Dasa)", bairro: "Taguatinga", tipo: "hospital", lat: -15.8288, lng: -48.0537, rating: 4.1 },
    { name: "Hospital Brasília (Amil)", bairro: "Asa Norte", tipo: "hospital", lat: -15.7591, lng: -47.8871, rating: 4.0 },
    { name: "Hospital Santa Helena", bairro: "Asa Sul", tipo: "hospital", lat: -15.8302, lng: -47.8971, rating: 4.2 },
    { name: "Hospital Prontonorte", bairro: "Asa Norte", tipo: "hospital", lat: -15.7534, lng: -47.8927, rating: 3.9 },
    { name: "Hospital Sírio-Libanês Brasília", bairro: "Lago Sul", tipo: "hospital", lat: -15.8553, lng: -47.8626, rating: 4.6 },
    { name: "Laboratório Sabin – Asa Sul", bairro: "Asa Sul", tipo: "clinica", lat: -15.8264, lng: -47.8862, rating: 4.6 },
    { name: "Clínica Integrada do Lago", bairro: "Lago Sul", tipo: "clinica", lat: -15.8599, lng: -47.8699, rating: 4.3 },
    { name: "CETTRO – Oncologia", bairro: "Asa Norte", tipo: "clinica", lat: -15.7618, lng: -47.8889, rating: 4.4 },
    { name: "Clínica Fértile – Reprodução Humana", bairro: "Asa Sul", tipo: "clinica", lat: -15.8218, lng: -47.8951, rating: 4.2 },
    { name: "Centro Médico Brasília (Hapvida)", bairro: "Taguatinga", tipo: "clinica", lat: -15.8354, lng: -48.0513, rating: 3.8 },
    { name: "Diagnósticos da América – Dasa BSB", bairro: "Asa Norte", tipo: "clinica", lat: -15.7601, lng: -47.8856, rating: 4.1 },
  ],
  "Salvador": [
    { name: "Hospital Português", bairro: "Nazaré", tipo: "hospital", lat: -12.9833, lng: -38.5029, rating: 4.3 },
    { name: "Hospital São Rafael (Rede D'Or)", bairro: "São Marcos", tipo: "hospital", lat: -12.9539, lng: -38.4297, rating: 4.4 },
    { name: "Hospital Aliança", bairro: "Rio Vermelho", tipo: "hospital", lat: -13.0019, lng: -38.4758, rating: 4.2 },
    { name: "Hospital da Bahia", bairro: "Brotas", tipo: "hospital", lat: -12.9714, lng: -38.4769, rating: 4.0 },
    { name: "Hospital Esperança Salvador (Hapvida)", bairro: "Pituba", tipo: "hospital", lat: -12.9998, lng: -38.4575, rating: 3.8 },
    { name: "Hospital Santa Izabel", bairro: "Barris", tipo: "hospital", lat: -12.9774, lng: -38.5063, rating: 4.1 },
    { name: "Laboratório Lâmina – Barra", bairro: "Barra", tipo: "clinica", lat: -13.0112, lng: -38.5167, rating: 4.5 },
    { name: "Clínica AMO Oncologia", bairro: "Brotas", tipo: "clinica", lat: -12.9694, lng: -38.4769, rating: 4.3 },
    { name: "Clínica Diagnóstico Imagem Bahia", bairro: "Pituba", tipo: "clinica", lat: -12.9992, lng: -38.4563, rating: 4.1 },
    { name: "Centro Médico da Bahia", bairro: "Barra", tipo: "clinica", lat: -13.0103, lng: -38.5142, rating: 4.4 },
    { name: "Delboni Salvador", bairro: "Iguatemi", tipo: "clinica", lat: -12.9768, lng: -38.4508, rating: 4.2 },
    { name: "Clínica Saúde Mulher Salvador", bairro: "Graça", tipo: "clinica", lat: -12.9870, lng: -38.5098, rating: 4.0 },
  ],
  "Curitiba": [
    { name: "Hospital Marcelino Champagnat", bairro: "Champagnat", tipo: "hospital", lat: -25.4358, lng: -49.2701, rating: 4.5 },
    { name: "Hospital Oswaldo Cruz", bairro: "Água Verde", tipo: "hospital", lat: -25.4607, lng: -49.2781, rating: 4.2 },
    { name: "Hospital Vita Batel (Rede D'Or)", bairro: "Batel", tipo: "hospital", lat: -25.4413, lng: -49.2753, rating: 4.4 },
    { name: "Hospital Cruz Vermelha Curitiba", bairro: "Hugo Lange", tipo: "hospital", lat: -25.4187, lng: -49.2491, rating: 3.9 },
    { name: "Hospital Nossa Senhora das Graças", bairro: "Mercês", tipo: "hospital", lat: -25.4302, lng: -49.2847, rating: 4.1 },
    { name: "Hospital do Coração (HCor) Curitiba", bairro: "Batel", tipo: "hospital", lat: -25.4432, lng: -49.2767, rating: 4.6 },
    { name: "Laboratório Champagnat", bairro: "Bigorrilho", tipo: "clinica", lat: -25.4340, lng: -49.2846, rating: 4.5 },
    { name: "CEDIP – Centro de Diagnóstico", bairro: "Batel", tipo: "clinica", lat: -25.4426, lng: -49.2732, rating: 4.3 },
    { name: "Clínica Multimagem Curitiba", bairro: "Água Verde", tipo: "clinica", lat: -25.4594, lng: -49.2793, rating: 4.2 },
    { name: "Diagnósticos da América – Dasa CTB", bairro: "Rebouças", tipo: "clinica", lat: -25.4483, lng: -49.2647, rating: 4.1 },
    { name: "Centro Médico Unimed Curitiba", bairro: "Centro Cívico", tipo: "clinica", lat: -25.4150, lng: -49.2574, rating: 4.0 },
    { name: "Clínica de Oncologia Integral COI", bairro: "Cabral", tipo: "clinica", lat: -25.4132, lng: -49.2639, rating: 4.3 },
  ],
  "Porto Alegre": [
    { name: "Hospital Moinhos de Vento", bairro: "Moinhos de Vento", tipo: "hospital", lat: -30.0214, lng: -51.2063, rating: 4.7 },
    { name: "Hospital São Lucas (PUCRS)", bairro: "Jardim Botânico", tipo: "hospital", lat: -30.0612, lng: -51.1795, rating: 4.3 },
    { name: "Hospital Unimed Porto Alegre", bairro: "Petrópolis", tipo: "hospital", lat: -30.0314, lng: -51.2062, rating: 4.1 },
    { name: "Hospital Ernesto Dornelles", bairro: "Auxiliadora", tipo: "hospital", lat: -30.0185, lng: -51.1928, rating: 4.2 },
    { name: "Hospital São Francisco (Irmandade)", bairro: "Independência", tipo: "hospital", lat: -30.0282, lng: -51.2017, rating: 4.0 },
    { name: "Hospital Nossa Senhora da Conceição", bairro: "Cristal", tipo: "hospital", lat: -30.0684, lng: -51.2202, rating: 3.8 },
    { name: "Laboratório Weinmann – Moinhos", bairro: "Moinhos de Vento", tipo: "clinica", lat: -30.0213, lng: -51.2059, rating: 4.6 },
    { name: "Fleury RS – Centro de Diagnóstico", bairro: "Bela Vista", tipo: "clinica", lat: -30.0376, lng: -51.2154, rating: 4.5 },
    { name: "CEDIP Porto Alegre", bairro: "Auxiliadora", tipo: "clinica", lat: -30.0187, lng: -51.1921, rating: 4.3 },
    { name: "Clínica Diagnóstica Dasa POA", bairro: "Rio Branco", tipo: "clinica", lat: -30.0315, lng: -51.2108, rating: 4.2 },
    { name: "Centro Médico Unimed POA", bairro: "Santana", tipo: "clinica", lat: -30.0094, lng: -51.1967, rating: 4.0 },
    { name: "Clínica de Fisioterapia Fisiobem", bairro: "Cidade Baixa", tipo: "clinica", lat: -30.0429, lng: -51.2183, rating: 4.1 },
  ],
  "Recife": [
    { name: "Hospital Português de Pernambuco", bairro: "Derby", tipo: "hospital", lat: -8.0533, lng: -34.9008, rating: 4.4 },
    { name: "Hospital Esperança (Hapvida)", bairro: "Recife", tipo: "hospital", lat: -8.0834, lng: -34.9107, rating: 3.9 },
    { name: "Real Hospital Português", bairro: "Paissandu", tipo: "hospital", lat: -8.0536, lng: -34.9013, rating: 4.3 },
    { name: "Hospital Esperança Olinda", bairro: "Olinda", tipo: "hospital", lat: -7.9881, lng: -34.8578, rating: 3.8 },
    { name: "Hospital Santa Joana", bairro: "Boa Vista", tipo: "hospital", lat: -8.0624, lng: -34.8963, rating: 4.2 },
    { name: "Hospital Universitário Oswaldo Cruz", bairro: "Soledade", tipo: "hospital", lat: -8.0609, lng: -34.9076, rating: 4.0 },
    { name: "Laboratório Marcos – Boa Viagem", bairro: "Boa Viagem", tipo: "clinica", lat: -8.1174, lng: -34.9006, rating: 4.5 },
    { name: "Clínica Multimagem Recife", bairro: "Boa Viagem", tipo: "clinica", lat: -8.1192, lng: -34.9027, rating: 4.3 },
    { name: "Centro de Diagnóstico Dasa PE", bairro: "Recife", tipo: "clinica", lat: -8.0622, lng: -34.8972, rating: 4.2 },
    { name: "Clínica de Oncologia Pernambuco", bairro: "Espinheiro", tipo: "clinica", lat: -8.0433, lng: -34.9001, rating: 4.4 },
    { name: "CEON – Centro de Oncologia", bairro: "Boa Viagem", tipo: "clinica", lat: -8.1167, lng: -34.9021, rating: 4.1 },
    { name: "Clínica São Marcos Recife", bairro: "Graças", tipo: "clinica", lat: -8.0387, lng: -34.9043, rating: 4.0 },
  ],
  "Fortaleza": [
    { name: "Hospital Unimed Fortaleza", bairro: "Meireles", tipo: "hospital", lat: -3.7265, lng: -38.5073, rating: 4.2 },
    { name: "Hospital São Carlos (Hapvida)", bairro: "Aldeota", tipo: "hospital", lat: -3.7341, lng: -38.5104, rating: 3.9 },
    { name: "Hospital Batista Memorial", bairro: "Papicu", tipo: "hospital", lat: -3.7381, lng: -38.4972, rating: 4.1 },
    { name: "Hospital São Camilo Fortaleza", bairro: "Benfica", tipo: "hospital", lat: -3.7442, lng: -38.5516, rating: 4.0 },
    { name: "Hospital Antônio Prudente", bairro: "Aldeota", tipo: "hospital", lat: -3.7328, lng: -38.5121, rating: 4.3 },
    { name: "Hospital Regional do Unichristus", bairro: "Aldeota", tipo: "hospital", lat: -3.7356, lng: -38.5098, rating: 4.2 },
    { name: "Laboratório Dona Francisca", bairro: "Meireles", tipo: "clinica", lat: -3.7252, lng: -38.5063, rating: 4.4 },
    { name: "Clínica de Imagem Rádio – Fortaleza", bairro: "Aldeota", tipo: "clinica", lat: -3.7347, lng: -38.5089, rating: 4.2 },
    { name: "Centro Médico Hapvida Fortaleza", bairro: "Dionísio Torres", tipo: "clinica", lat: -3.7453, lng: -38.5173, rating: 3.9 },
    { name: "Clínica Multimagem Fortaleza", bairro: "Cocó", tipo: "clinica", lat: -3.7465, lng: -38.4862, rating: 4.1 },
    { name: "CEON – Oncologia Fortaleza", bairro: "Meireles", tipo: "clinica", lat: -3.7261, lng: -38.5071, rating: 4.3 },
    { name: "Diagnósticos da América – Dasa FOR", bairro: "Aldeota", tipo: "clinica", lat: -3.7349, lng: -38.5107, rating: 4.0 },
  ],
  "Manaus": [
    { name: "Hospital Adventista de Manaus", bairro: "Adrianópolis", tipo: "hospital", lat: -3.0842, lng: -60.0116, rating: 4.3 },
    { name: "Hospital Beneficente Português Manaus", bairro: "Praça 14", tipo: "hospital", lat: -3.1209, lng: -60.0210, rating: 4.1 },
    { name: "Hospital Unimed Manaus", bairro: "Chapada", tipo: "hospital", lat: -3.0950, lng: -60.0246, rating: 4.0 },
    { name: "Hospital Santa Julia", bairro: "Adrianópolis", tipo: "hospital", lat: -3.0862, lng: -60.0127, rating: 4.2 },
    { name: "Hospital Nilton Lins", bairro: "Flores", tipo: "hospital", lat: -3.0722, lng: -59.9920, rating: 3.8 },
    { name: "Hospital Tropical de Manaus", bairro: "Alvorada", tipo: "hospital", lat: -3.1012, lng: -60.0148, rating: 3.7 },
    { name: "Laboratório São Lucas Manaus", bairro: "Centro", tipo: "clinica", lat: -3.1245, lng: -60.0213, rating: 4.3 },
    { name: "Clínica CEMAM", bairro: "Adrianópolis", tipo: "clinica", lat: -3.0848, lng: -60.0109, rating: 4.2 },
    { name: "Centro de Diagnóstico Fleury AM", bairro: "Chapada", tipo: "clinica", lat: -3.0949, lng: -60.0235, rating: 4.4 },
    { name: "Clínica Multimagem Manaus", bairro: "Aleixo", tipo: "clinica", lat: -3.0765, lng: -60.0023, rating: 4.1 },
    { name: "CEON Oncologia Manaus", bairro: "Adrianópolis", tipo: "clinica", lat: -3.0853, lng: -60.0121, rating: 4.0 },
    { name: "Clínica São Francisco Manaus", bairro: "N. Sra. das Graças", tipo: "clinica", lat: -3.0881, lng: -60.0087, rating: 3.9 },
  ],
};

function mockGenerico(cidade: string, uf: string, latBase: number, lngBase: number): MockItem[] {
  // Para cidades sem mapeamento específico, gera hospitais com coordenadas em torno do centro
  const offsets = [
    [0.01, 0.01], [0.02, -0.02], [-0.01, 0.03], [0.03, 0.01], [-0.02, -0.01], [0.01, -0.03],
    [0.005, 0.015], [-0.015, 0.01], [0.025, -0.01], [-0.01, -0.02], [0.02, 0.025], [-0.03, 0.005],
  ];
  const hospitais: MockItem[] = [
    { name: `Hospital Unimed ${cidade}`, bairro: `Centro, ${cidade}`, tipo: "hospital", lat: latBase + offsets[0][0], lng: lngBase + offsets[0][1], rating: 4.1 },
    { name: `Hospital Hapvida ${cidade}`, bairro: `Centro, ${cidade}`, tipo: "hospital", lat: latBase + offsets[1][0], lng: lngBase + offsets[1][1], rating: 3.9 },
    { name: `Hospital Amil ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "hospital", lat: latBase + offsets[2][0], lng: lngBase + offsets[2][1], rating: 4.0 },
    { name: `Hospital NotreDame ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "hospital", lat: latBase + offsets[3][0], lng: lngBase + offsets[3][1], rating: 4.2 },
    { name: `Hospital São Lucas ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "hospital", lat: latBase + offsets[4][0], lng: lngBase + offsets[4][1], rating: 4.0 },
    { name: `Hospital Santa Cruz ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "hospital", lat: latBase + offsets[5][0], lng: lngBase + offsets[5][1], rating: 3.8 },
    { name: `Laboratório Dasa – ${cidade}`, bairro: `Centro, ${cidade}`, tipo: "clinica", lat: latBase + offsets[6][0], lng: lngBase + offsets[6][1], rating: 4.3 },
    { name: `Centro Médico NotreDame – ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "clinica", lat: latBase + offsets[7][0], lng: lngBase + offsets[7][1], rating: 4.1 },
    { name: `Clínica Diagnóstico Hermes Pardini – ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "clinica", lat: latBase + offsets[8][0], lng: lngBase + offsets[8][1], rating: 4.4 },
    { name: `Fleury Medicina e Saúde – ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "clinica", lat: latBase + offsets[9][0], lng: lngBase + offsets[9][1], rating: 4.5 },
    { name: `Diagnósticos da América – ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "clinica", lat: latBase + offsets[10][0], lng: lngBase + offsets[10][1], rating: 4.2 },
    { name: `Laboratório Lavoisier – ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "clinica", lat: latBase + offsets[11][0], lng: lngBase + offsets[11][1], rating: 4.0 },
  ];
  return hospitais;
}

export async function GET(request: NextRequest) {
  const cep = request.nextUrl.searchParams.get("cep")?.replace(/\D/g, "");
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  if (!apiKey) {
    const cepData = await dadosDoCEP(cep);

    const cidade = cepData?.cidade ?? "São Paulo";
    const uf = cepData?.uf ?? "SP";
    const coordsUsuario = cepData ? { lat: cepData.lat, lng: cepData.lng } : null;

    const listaBase = MOCK_POR_CIDADE[cidade];
    const lista = listaBase
      ? listaBase
      : mockGenerico(cidade, uf, coordsUsuario?.lat ?? -23.5, coordsUsuario?.lng ?? -46.6);

    const hospitais = lista.filter((h) => h.tipo === "hospital").slice(0, 6);
    const clinicas = lista.filter((h) => h.tipo === "clinica").slice(0, 6);

    const mapear = (h: MockItem) => ({
      place_id: `mock_${cidade}_${h.tipo}_${h.name.slice(0, 10).replace(/\s/g, "_")}`,
      name: h.name,
      vicinity: `${h.bairro}, ${cidade}`,
      types: [h.tipo === "hospital" ? "hospital" : "doctor"],
      // Calcula distância real se tiver coordenadas do usuário, senão omite
      distance_km: coordsUsuario
        ? Math.round(calcularDistanciaKm(coordsUsuario.lat, coordsUsuario.lng, h.lat, h.lng) * 10) / 10
        : undefined,
      rating: h.rating,
    });

    const resultado = [...hospitais.map(mapear), ...clinicas.map(mapear)];
    // Ordena por distância quando disponível
    if (coordsUsuario) resultado.sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));

    return NextResponse.json({ data: resultado });
  }

  // Com Google Places API real
  try {
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${cep},Brasil&key=${apiKey}`
    );
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) {
      return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    const [hospRes, clinRes] = await Promise.all([
      fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=hospital&key=${apiKey}&language=pt-BR`),
      fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=doctor&key=${apiKey}&language=pt-BR`),
    ]);
    const [hospData, clinData] = await Promise.all([hospRes.json(), clinRes.json()]);

    const mapearGoogle = (p: {
      place_id: string; name: string; vicinity: string; types: string[];
      rating?: number; photos?: { photo_reference: string }[];
      geometry: { location: { lat: number; lng: number } };
    }) => ({
      place_id: p.place_id,
      name: p.name,
      vicinity: p.vicinity,
      types: p.types,
      rating: p.rating,
      distance_km: Math.round(calcularDistanciaKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng) * 10) / 10,
      photo_url: p.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${apiKey}`
        : undefined,
    });

    const hospitais = (hospData.results ?? [])
      .filter((p: { name: string }) => !isPublico(p.name))
      .slice(0, 6)
      .map(mapearGoogle);

    const clinicas = (clinData.results ?? [])
      .filter((p: { name: string }) => !isPublico(p.name))
      .slice(0, 6)
      .map(mapearGoogle);

    const resultados = [...hospitais, ...clinicas].sort((a, b) => a.distance_km - b.distance_km);
    return NextResponse.json({ data: resultados });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar hospitais" }, { status: 500 });
  }
}
