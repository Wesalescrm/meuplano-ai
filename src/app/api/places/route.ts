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

// Fotos consistentes por seed — usa picsum.photos (imagens reais sem autenticação)
function foto(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/200`;
}

type MockItem = { name: string; bairro: string; tipo: "hospital" | "clinica"; dist: number; rating: number };

const MOCK_POR_CIDADE: Record<string, MockItem[]> = {
  "Rio de Janeiro": [
    { name: "Hospital Samaritano Botafogo", bairro: "Botafogo", tipo: "hospital", dist: 1.4, rating: 4.3 },
    { name: "Hospital Copa D'Or (Rede D'Or)", bairro: "Copacabana", tipo: "hospital", dist: 2.3, rating: 4.5 },
    { name: "Hospital São Lucas Barra", bairro: "Barra da Tijuca", tipo: "hospital", dist: 3.5, rating: 4.1 },
    { name: "Hospital Vitória (Amil)", bairro: "América", tipo: "hospital", dist: 4.1, rating: 3.9 },
    { name: "Hospital Clínica São Gonçalo (Rede D'Or)", bairro: "São Gonçalo", tipo: "hospital", dist: 5.2, rating: 4.2 },
    { name: "Hospital Badim (Rede D'Or)", bairro: "Méier", tipo: "hospital", dist: 6.0, rating: 4.0 },
    { name: "CDPI – Centro de Diagnóstico por Imagem", bairro: "Barra da Tijuca", tipo: "clinica", dist: 0.9, rating: 4.6 },
    { name: "Clínica São Vicente (Rede D'Or)", bairro: "Gávea", tipo: "clinica", dist: 1.8, rating: 4.4 },
    { name: "Laboratório Delboni Auriemo", bairro: "Ipanema", tipo: "clinica", dist: 2.1, rating: 4.3 },
    { name: "Clínica Check-Up Rio", bairro: "Leblon", tipo: "clinica", dist: 2.7, rating: 4.5 },
    { name: "Diagnósticos da América – Dasa RJ", bairro: "Botafogo", tipo: "clinica", dist: 3.3, rating: 4.2 },
    { name: "Clínica Multi Image (Barra)", bairro: "Barra da Tijuca", tipo: "clinica", dist: 4.0, rating: 4.1 },
  ],
  "São Paulo": [
    { name: "Hospital Israelita Albert Einstein", bairro: "Morumbi", tipo: "hospital", dist: 4.5, rating: 4.8 },
    { name: "Hospital Sírio-Libanês", bairro: "Bela Vista", tipo: "hospital", dist: 2.3, rating: 4.7 },
    { name: "Hospital São Camilo Pompéia", bairro: "Pompéia", tipo: "hospital", dist: 3.1, rating: 4.2 },
    { name: "Hospital 9 de Julho", bairro: "Jardins", tipo: "hospital", dist: 3.7, rating: 4.1 },
    { name: "Hospital Oswaldo Cruz Vergueiro", bairro: "Vergueiro", tipo: "hospital", dist: 5.0, rating: 4.0 },
    { name: "Hospital e Maternidade São Luiz", bairro: "Itaim Bibi", tipo: "hospital", dist: 5.8, rating: 4.3 },
    { name: "Fleury Medicina e Saúde", bairro: "Paraíso", tipo: "clinica", dist: 1.8, rating: 4.7 },
    { name: "Laboratório Lavoisier", bairro: "Pinheiros", tipo: "clinica", dist: 2.2, rating: 4.4 },
    { name: "Delboni Auriemo – Vila Olímpia", bairro: "Vila Olímpia", tipo: "clinica", dist: 2.9, rating: 4.3 },
    { name: "AACD – Reabilitação e Fisioterapia", bairro: "Vila Mariana", tipo: "clinica", dist: 3.3, rating: 4.5 },
    { name: "Centro de Medicina Diagnóstica Fleury", bairro: "Moema", tipo: "clinica", dist: 3.7, rating: 4.6 },
    { name: "Clínica de Oncologia Américas", bairro: "Morumbi", tipo: "clinica", dist: 4.5, rating: 4.2 },
  ],
  "Belo Horizonte": [
    { name: "Hospital Mater Dei Contorno", bairro: "Contorno", tipo: "hospital", dist: 1.6, rating: 4.6 },
    { name: "Hospital Biocor (Dasa)", bairro: "Nova Lima", tipo: "hospital", dist: 4.8, rating: 4.4 },
    { name: "Hospital da Unimed BH", bairro: "Funcionários", tipo: "hospital", dist: 2.1, rating: 4.2 },
    { name: "Hospital Lifecenter", bairro: "Santo Antônio", tipo: "hospital", dist: 3.0, rating: 4.1 },
    { name: "Hospital Vera Cruz", bairro: "Carlos Prates", tipo: "hospital", dist: 3.8, rating: 3.9 },
    { name: "Hospital Felício Rocho", bairro: "Lourdes", tipo: "hospital", dist: 2.5, rating: 4.3 },
    { name: "Laboratório Hermes Pardini", bairro: "Centro", tipo: "clinica", dist: 1.2, rating: 4.5 },
    { name: "Clínica CEDIP", bairro: "Sion", tipo: "clinica", dist: 2.4, rating: 4.3 },
    { name: "Centro Médico Unimed BH Savassi", bairro: "Savassi", tipo: "clinica", dist: 2.8, rating: 4.4 },
    { name: "Diagnósticos da América – Dasa BH", bairro: "Funcionários", tipo: "clinica", dist: 3.1, rating: 4.2 },
    { name: "Clínica de Reabilitação Pioneira", bairro: "Gutierrez", tipo: "clinica", dist: 3.7, rating: 4.0 },
    { name: "Laboratório Santa Fé", bairro: "Buritis", tipo: "clinica", dist: 4.2, rating: 4.1 },
  ],
  "Brasília": [
    { name: "Hospital Santa Lúcia", bairro: "Asa Sul", tipo: "hospital", dist: 2.0, rating: 4.4 },
    { name: "Hospital Anchieta (Dasa)", bairro: "Taguatinga", tipo: "hospital", dist: 4.5, rating: 4.1 },
    { name: "Hospital Brasília (Amil)", bairro: "Asa Norte", tipo: "hospital", dist: 3.2, rating: 4.0 },
    { name: "Hospital Santa Helena", bairro: "Asa Sul", tipo: "hospital", dist: 2.8, rating: 4.2 },
    { name: "Hospital Prontonorte", bairro: "Asa Norte", tipo: "hospital", dist: 3.6, rating: 3.9 },
    { name: "Hospital Sírio-Libanês Brasília", bairro: "Lago Sul", tipo: "hospital", dist: 5.0, rating: 4.6 },
    { name: "Laboratório Sabin – Asa Sul", bairro: "Asa Sul", tipo: "clinica", dist: 1.5, rating: 4.6 },
    { name: "Clínica Integrada do Lago", bairro: "Lago Sul", tipo: "clinica", dist: 3.0, rating: 4.3 },
    { name: "CETTRO – Oncologia", bairro: "Asa Norte", tipo: "clinica", dist: 2.5, rating: 4.4 },
    { name: "Clínica Fértile – Reprodução Humana", bairro: "Asa Sul", tipo: "clinica", dist: 2.2, rating: 4.2 },
    { name: "Centro Médico Brasília (Hapvida)", bairro: "Taguatinga", tipo: "clinica", dist: 4.7, rating: 3.8 },
    { name: "Diagnósticos da América – Dasa BSB", bairro: "Asa Norte", tipo: "clinica", dist: 3.3, rating: 4.1 },
  ],
  "Salvador": [
    { name: "Hospital Português", bairro: "Nazaré", tipo: "hospital", dist: 2.2, rating: 4.3 },
    { name: "Hospital São Rafael (Rede D'Or)", bairro: "São Marcos", tipo: "hospital", dist: 3.8, rating: 4.4 },
    { name: "Hospital Aliança", bairro: "Rio Vermelho", tipo: "hospital", dist: 4.1, rating: 4.2 },
    { name: "Hospital da Bahia", bairro: "Brotas", tipo: "hospital", dist: 3.0, rating: 4.0 },
    { name: "Hospital Esperança Salvador (Hapvida)", bairro: "Pituba", tipo: "hospital", dist: 4.5, rating: 3.8 },
    { name: "Hospital Universitário Prof. Edgard Santos", bairro: "Canela", tipo: "hospital", dist: 5.2, rating: 3.7 },
    { name: "Laboratório Lâmina – Barra", bairro: "Barra", tipo: "clinica", dist: 1.4, rating: 4.5 },
    { name: "Clínica AMO Oncologia", bairro: "Brotas", tipo: "clinica", dist: 2.9, rating: 4.3 },
    { name: "Clínica Diagnóstico Imagem Bahia", bairro: "Pituba", tipo: "clinica", dist: 3.5, rating: 4.1 },
    { name: "Centro Médico da Bahia", bairro: "Barra", tipo: "clinica", dist: 1.8, rating: 4.4 },
    { name: "Delboni Salvador", bairro: "Iguatemi", tipo: "clinica", dist: 4.1, rating: 4.2 },
    { name: "Clínica Saúde Mulher Salvador", bairro: "Graça", tipo: "clinica", dist: 2.4, rating: 4.0 },
  ],
  "Curitiba": [
    { name: "Hospital Marcelino Champagnat", bairro: "Champagnat", tipo: "hospital", dist: 2.5, rating: 4.5 },
    { name: "Hospital Oswaldo Cruz", bairro: "Água Verde", tipo: "hospital", dist: 3.1, rating: 4.2 },
    { name: "Hospital Vita Batel (Rede D'Or)", bairro: "Batel", tipo: "hospital", dist: 1.8, rating: 4.4 },
    { name: "Hospital Cruz Vermelha Curitiba", bairro: "Hugo Lange", tipo: "hospital", dist: 4.0, rating: 3.9 },
    { name: "Hospital Nossa Senhora das Graças", bairro: "Mercês", tipo: "hospital", dist: 3.5, rating: 4.1 },
    { name: "Hospital do Coração (HCor) Curitiba", bairro: "Batel", tipo: "hospital", dist: 2.2, rating: 4.6 },
    { name: "Laboratório Champagnat", bairro: "Bigorrilho", tipo: "clinica", dist: 1.1, rating: 4.5 },
    { name: "CEDIP – Centro de Diagnóstico", bairro: "Batel", tipo: "clinica", dist: 2.0, rating: 4.3 },
    { name: "Clínica Multimagem Curitiba", bairro: "Água Verde", tipo: "clinica", dist: 2.7, rating: 4.2 },
    { name: "Diagnósticos da América – Dasa CTB", bairro: "Rebouças", tipo: "clinica", dist: 3.2, rating: 4.1 },
    { name: "Centro Médico Unimed Curitiba", bairro: "Centro Cívico", tipo: "clinica", dist: 3.8, rating: 4.0 },
    { name: "Clínica de Oncologia Integral COI", bairro: "Cabral", tipo: "clinica", dist: 4.3, rating: 4.3 },
  ],
  "Porto Alegre": [
    { name: "Hospital Moinhos de Vento", bairro: "Moinhos de Vento", tipo: "hospital", dist: 1.9, rating: 4.7 },
    { name: "Hospital São Lucas (PUCRS)", bairro: "Jardim Botânico", tipo: "hospital", dist: 3.4, rating: 4.3 },
    { name: "Hospital Unimed Porto Alegre", bairro: "Petrópolis", tipo: "hospital", dist: 2.7, rating: 4.1 },
    { name: "Hospital Ernesto Dornelles", bairro: "Auxiliadora", tipo: "hospital", dist: 2.2, rating: 4.2 },
    { name: "Hospital São Francisco (Irmandade)", bairro: "Independência", tipo: "hospital", dist: 3.0, rating: 4.0 },
    { name: "Hospital Nossa Senhora da Conceição", bairro: "Cristal", tipo: "hospital", dist: 4.5, rating: 3.8 },
    { name: "Laboratório Weinmann – Moinhos", bairro: "Moinhos de Vento", tipo: "clinica", dist: 1.5, rating: 4.6 },
    { name: "Fleury RS – Centro de Diagnóstico", bairro: "Bela Vista", tipo: "clinica", dist: 2.3, rating: 4.5 },
    { name: "CEDIP Porto Alegre", bairro: "Auxiliadora", tipo: "clinica", dist: 2.8, rating: 4.3 },
    { name: "Clínica Diagnéstica Dasa POA", bairro: "Rio Branco", tipo: "clinica", dist: 3.1, rating: 4.2 },
    { name: "Centro Médico Unimed POA", bairro: "Santana", tipo: "clinica", dist: 3.7, rating: 4.0 },
    { name: "Clínica de Fisioterapia Fisiobem", bairro: "Cidade Baixa", tipo: "clinica", dist: 4.2, rating: 4.1 },
  ],
  "Recife": [
    { name: "Hospital Português de Pernambuco", bairro: "Derby", tipo: "hospital", dist: 2.1, rating: 4.4 },
    { name: "Hospital Esperança (Hapvida)", bairro: "Recife", tipo: "hospital", dist: 3.3, rating: 3.9 },
    { name: "Real Hospital Português", bairro: "Recife", tipo: "hospital", dist: 2.5, rating: 4.3 },
    { name: "Hospital Esperança Olinda", bairro: "Olinda", tipo: "hospital", dist: 5.0, rating: 3.8 },
    { name: "Hospital da Restauração (privado)", bairro: "Derby", tipo: "hospital", dist: 2.8, rating: 4.0 },
    { name: "Hospital Barão de Lucena (Rede)", bairro: "Iputinga", tipo: "hospital", dist: 4.2, rating: 3.7 },
    { name: "Laboratório Marcos – Boa Viagem", bairro: "Boa Viagem", tipo: "clinica", dist: 1.4, rating: 4.5 },
    { name: "Clínica Multimagem Recife", bairro: "Boa Viagem", tipo: "clinica", dist: 2.0, rating: 4.3 },
    { name: "Centro de Diagnóstico Dasa PE", bairro: "Recife", tipo: "clinica", dist: 2.6, rating: 4.2 },
    { name: "Clínica de Oncologia Pernambuco", bairro: "Espinheiro", tipo: "clinica", dist: 3.2, rating: 4.4 },
    { name: "CEON – Centro de Oncologia", bairro: "Boa Viagem", tipo: "clinica", dist: 3.8, rating: 4.1 },
    { name: "Clínica São Marcos Recife", bairro: "Graças", tipo: "clinica", dist: 4.4, rating: 4.0 },
  ],
  "Fortaleza": [
    { name: "Hospital Unimed Fortaleza", bairro: "Meireles", tipo: "hospital", dist: 1.8, rating: 4.2 },
    { name: "Hospital São Carlos (Hapvida)", bairro: "Aldeota", tipo: "hospital", dist: 2.5, rating: 3.9 },
    { name: "Hospital Batista Memorial", bairro: "Papicu", tipo: "hospital", dist: 3.2, rating: 4.1 },
    { name: "Hospital São Camilo Fortaleza", bairro: "Benfica", tipo: "hospital", dist: 4.0, rating: 4.0 },
    { name: "Hospital Antônio Prudente", bairro: "Aldeota", tipo: "hospital", dist: 2.0, rating: 4.3 },
    { name: "Hospital Regional do Unichristus", bairro: "Aldeota", tipo: "hospital", dist: 2.8, rating: 4.2 },
    { name: "Laboratório Dona Francisca", bairro: "Meireles", tipo: "clinica", dist: 1.2, rating: 4.4 },
    { name: "Clínica de Imagem Rádio – Fortaleza", bairro: "Aldeota", tipo: "clinica", dist: 2.1, rating: 4.2 },
    { name: "Centro Médico Hapvida Fortaleza", bairro: "Dionísio Torres", tipo: "clinica", dist: 2.7, rating: 3.9 },
    { name: "Clínica Multimagem Fortaleza", bairro: "Cocó", tipo: "clinica", dist: 3.3, rating: 4.1 },
    { name: "CEON – Oncologia Fortaleza", bairro: "Meireles", tipo: "clinica", dist: 3.9, rating: 4.3 },
    { name: "Diagnósticos da América – Dasa FOR", bairro: "Aldeota", tipo: "clinica", dist: 4.5, rating: 4.0 },
  ],
  "Manaus": [
    { name: "Hospital Adventista de Manaus", bairro: "Adrianópolis", tipo: "hospital", dist: 2.2, rating: 4.3 },
    { name: "Hospital Beneficente Português Manaus", bairro: "Praça 14", tipo: "hospital", dist: 3.0, rating: 4.1 },
    { name: "Hospital Unimed Manaus", bairro: "Chapada", tipo: "hospital", dist: 3.8, rating: 4.0 },
    { name: "Hospital Santa Julia", bairro: "Adrianópolis", tipo: "hospital", dist: 2.7, rating: 4.2 },
    { name: "Hospital Nilton Lins", bairro: "Flores", tipo: "hospital", dist: 4.5, rating: 3.8 },
    { name: "Hospital Tropical Doutor Heitor Vieira Dourado", bairro: "Alvorada", tipo: "hospital", dist: 5.1, rating: 3.7 },
    { name: "Laboratório São Lucas Manaus", bairro: "Centro", tipo: "clinica", dist: 1.4, rating: 4.3 },
    { name: "Clínica CEMAM", bairro: "Adrianópolis", tipo: "clinica", dist: 2.0, rating: 4.2 },
    { name: "Centro de Diagnóstico Fleury AM", bairro: "Chapada", tipo: "clinica", dist: 2.8, rating: 4.4 },
    { name: "Clínica Multimagem Manaus", bairro: "Aleixo", tipo: "clinica", dist: 3.4, rating: 4.1 },
    { name: "CEON Oncologia Manaus", bairro: "Adrianópolis", tipo: "clinica", dist: 3.9, rating: 4.0 },
    { name: "Clínica São Francisco Manaus", bairro: "Nossa Senhora das Graças", tipo: "clinica", dist: 4.6, rating: 3.9 },
  ],
};

function mockGenerico(cidade: string, uf: string): MockItem[] {
  return [
    { name: `Hospital Unimed ${cidade}`, bairro: `Centro, ${cidade}`, tipo: "hospital", dist: 1.8, rating: 4.1 },
    { name: `Hospital Hapvida ${cidade}`, bairro: `Centro, ${cidade}`, tipo: "hospital", dist: 2.4, rating: 3.9 },
    { name: `Hospital Amil ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "hospital", dist: 3.0, rating: 4.0 },
    { name: `Hospital NotreDame ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "hospital", dist: 3.7, rating: 4.2 },
    { name: `Hospital São Lucas ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "hospital", dist: 4.2, rating: 4.0 },
    { name: `Hospital Santa Cruz ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "hospital", dist: 5.0, rating: 3.8 },
    { name: `Laboratório Dasa – ${cidade}`, bairro: `Centro, ${cidade}`, tipo: "clinica", dist: 1.1, rating: 4.3 },
    { name: `Centro Médico NotreDame – ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "clinica", dist: 2.0, rating: 4.1 },
    { name: `Clínica Diagnóstico Hermes Pardini – ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "clinica", dist: 2.8, rating: 4.4 },
    { name: `Fleury Medicina e Saúde – ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "clinica", dist: 3.5, rating: 4.5 },
    { name: `Diagnósticos da América – ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "clinica", dist: 4.1, rating: 4.2 },
    { name: `Laboratório Lavoisier – ${cidade}`, bairro: `${cidade} – ${uf}`, tipo: "clinica", dist: 4.8, rating: 4.0 },
  ];
}

export async function GET(request: NextRequest) {
  const cep = request.nextUrl.searchParams.get("cep")?.replace(/\D/g, "");
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  if (!apiKey) {
    let cidade = "São Paulo";
    let uf = "SP";
    try {
      const viaRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const viaData = await viaRes.json();
      if (!viaData.erro) {
        cidade = viaData.localidade ?? cidade;
        uf = viaData.uf ?? uf;
      }
    } catch {
      // fallback SP
    }

    const lista = MOCK_POR_CIDADE[cidade] ?? mockGenerico(cidade, uf);
    const hospitais = lista.filter((h) => h.tipo === "hospital").slice(0, 6);
    const clinicas = lista.filter((h) => h.tipo === "clinica").slice(0, 6);

    const mapear = (h: MockItem, i: number) => ({
      place_id: `mock_${cidade}_${h.tipo}_${i}`,
      name: h.name,
      vicinity: `${h.bairro}, ${cidade}`,
      types: [h.tipo === "hospital" ? "hospital" : "doctor"],
      distance_km: h.dist,
      rating: h.rating,
    });

    return NextResponse.json({ data: [...hospitais.map(mapear), ...clinicas.map(mapear)] });
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
      distance_km: calcularDistanciaKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng),
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
