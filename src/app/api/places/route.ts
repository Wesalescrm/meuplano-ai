import { NextRequest, NextResponse } from "next/server";

// Palavras que indicam estabelecimentos públicos — irrelevantes para plano privado
const PUBLICO_KEYWORDS = [
  "UPA", "UBS", "CAPS", "CRAS", "CREAS",
  "Hospital Municipal", "Hospital Estadual", "Hospital Federal",
  "Hospital das Clínicas",
  "Pronto Socorro Municipal",
  "Unidade Básica",
  "Unidade de Pronto Atendimento",
  "Unidade de Saúde",
  "Policlínica Municipal",
  "Secretaria de Saúde",
  "Centro de Saúde",
];

function isPublico(nome: string): boolean {
  const upper = nome.toUpperCase();
  return PUBLICO_KEYWORDS.some((kw) => upper.includes(kw.toUpperCase()));
}

function calcularDistanciaKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Mock de hospitais e clínicas PRIVADAS por cidade
// Separados por tipo: "hospital" ou "clinica"
const MOCK_POR_CIDADE: Record<string, { name: string; bairro: string; tipo: "hospital" | "clinica"; dist: number }[]> = {
  "Rio de Janeiro": [
    { name: "Hospital Samaritano Botafogo", bairro: "Botafogo", tipo: "hospital", dist: 1.4 },
    { name: "Hospital Copa D'Or (Rede D'Or)", bairro: "Copacabana", tipo: "hospital", dist: 2.3 },
    { name: "Hospital São Lucas (Barra)", bairro: "Barra da Tijuca", tipo: "hospital", dist: 3.5 },
    { name: "Hospital Vitória (Amil)", bairro: "América", tipo: "hospital", dist: 4.1 },
    { name: "CDPI – Centro de Diagnóstico por Imagem", bairro: "Barra da Tijuca", tipo: "clinica", dist: 0.9 },
    { name: "Clínica São Vicente (Rede D'Or)", bairro: "Gávea", tipo: "clinica", dist: 1.8 },
    { name: "Laboratório Delboni Auriemo", bairro: "Ipanema", tipo: "clinica", dist: 2.1 },
    { name: "Clínica Check-Up Rio", bairro: "Leblon", tipo: "clinica", dist: 2.7 },
  ],
  "São Paulo": [
    { name: "Hospital Israelita Albert Einstein", bairro: "Morumbi", tipo: "hospital", dist: 4.5 },
    { name: "Hospital Sírio-Libanês", bairro: "Bela Vista", tipo: "hospital", dist: 2.3 },
    { name: "Hospital São Camilo", bairro: "Pompéia", tipo: "hospital", dist: 3.1 },
    { name: "Hospital 9 de Julho", bairro: "Jardins", tipo: "hospital", dist: 3.7 },
    { name: "Fleury Medicina e Saúde", bairro: "Paraíso", tipo: "clinica", dist: 1.8 },
    { name: "Laboratório Lavoisier", bairro: "Pinheiros", tipo: "clinica", dist: 2.2 },
    { name: "Clínica de Diagnóstico Delboni", bairro: "Vila Olímpia", tipo: "clinica", dist: 2.9 },
    { name: "AACD – Reabilitação", bairro: "Vila Mariana", tipo: "clinica", dist: 3.3 },
  ],
  "Belo Horizonte": [
    { name: "Hospital Mater Dei Contorno", bairro: "Contorno", tipo: "hospital", dist: 1.6 },
    { name: "Hospital Biocor (Dasa)", bairro: "Nova Lima", tipo: "hospital", dist: 4.8 },
    { name: "Hospital da Unimed BH", bairro: "Funcionários", tipo: "hospital", dist: 2.1 },
    { name: "Hospital Lifecenter", bairro: "Santo Antônio", tipo: "hospital", dist: 3.0 },
    { name: "Laboratório Hermes Pardini", bairro: "Centro", tipo: "clinica", dist: 1.2 },
    { name: "Clínica CEDIP", bairro: "Sion", tipo: "clinica", dist: 2.4 },
    { name: "Centro Médico Unimed BH", bairro: "Savassi", tipo: "clinica", dist: 2.8 },
  ],
  "Brasília": [
    { name: "Hospital Santa Lúcia", bairro: "Asa Sul", tipo: "hospital", dist: 2.0 },
    { name: "Hospital Anchieta (Dasa)", bairro: "Taguatinga", tipo: "hospital", dist: 4.5 },
    { name: "Hospital Brasília (Amil)", bairro: "Asa Norte", tipo: "hospital", dist: 3.2 },
    { name: "Clínica SARAH", bairro: "Lago Norte", tipo: "hospital", dist: 5.1 },
    { name: "Laboratório Sabin", bairro: "Asa Sul", tipo: "clinica", dist: 1.5 },
    { name: "Clínica Integrada do Lago", bairro: "Lago Sul", tipo: "clinica", dist: 3.0 },
  ],
  "Salvador": [
    { name: "Hospital Português", bairro: "Nazaré", tipo: "hospital", dist: 2.2 },
    { name: "Hospital São Rafael (Rede D'Or)", bairro: "São Marcos", tipo: "hospital", dist: 3.8 },
    { name: "Hospital Aliança", bairro: "Rio Vermelho", tipo: "hospital", dist: 4.1 },
    { name: "Laboratório Lâmina", bairro: "Barra", tipo: "clinica", dist: 1.4 },
    { name: "Clínica AMO Oncologia", bairro: "Brotas", tipo: "clinica", dist: 2.9 },
  ],
  "Curitiba": [
    { name: "Hospital Marcelino Champagnat", bairro: "Champagnat", tipo: "hospital", dist: 2.5 },
    { name: "Hospital Oswaldo Cruz", bairro: "Água Verde", tipo: "hospital", dist: 3.1 },
    { name: "Hospital Vita Batel (Rede D'Or)", bairro: "Batel", tipo: "hospital", dist: 1.8 },
    { name: "Laboratório Champagnat", bairro: "Bigorrilho", tipo: "clinica", dist: 1.1 },
    { name: "CEDIP – Centro de Diagnóstico", bairro: "Batel", tipo: "clinica", dist: 2.0 },
  ],
  "Porto Alegre": [
    { name: "Hospital Moinhos de Vento", bairro: "Moinhos de Vento", tipo: "hospital", dist: 1.9 },
    { name: "Hospital São Lucas (PUCRS)", bairro: "Jardim Botânico", tipo: "hospital", dist: 3.4 },
    { name: "Hospital Unimed Porto Alegre", bairro: "Petrópolis", tipo: "hospital", dist: 2.7 },
    { name: "Laboratório Weinmann", bairro: "Moinhos de Vento", tipo: "clinica", dist: 1.5 },
    { name: "Clínica de Diagnóstico Fleury RS", bairro: "Bela Vista", tipo: "clinica", dist: 2.3 },
  ],
  "Recife": [
    { name: "Hospital Português de Pernambuco", bairro: "Derby", tipo: "hospital", dist: 2.1 },
    { name: "Hospital Esperança (Hapvida)", bairro: "Recife", tipo: "hospital", dist: 3.3 },
    { name: "Real Hospital Português", bairro: "Recife", tipo: "hospital", dist: 2.5 },
    { name: "Laboratório Marcos", bairro: "Boa Viagem", tipo: "clinica", dist: 1.4 },
    { name: "Clínica Multimagem", bairro: "Boa Viagem", tipo: "clinica", dist: 2.0 },
  ],
};

// Fallback genérico com o nome da cidade injetado
function mockGenerico(cidade: string, uf: string) {
  return [
    { name: `Hospital Unimed ${cidade}`, bairro: `Centro, ${cidade}`, tipo: "hospital" as const, dist: 1.8 },
    { name: `Hospital Hapvida ${cidade}`, bairro: `Centro, ${cidade}`, tipo: "hospital" as const, dist: 2.4 },
    { name: `Hospital Amil ${cidade}`, bairro: `${uf}`, tipo: "hospital" as const, dist: 3.0 },
    { name: `Laboratório Dasa – ${cidade}`, bairro: `Centro, ${cidade}`, tipo: "clinica" as const, dist: 1.1 },
    { name: `Centro Médico NotreDame – ${cidade}`, bairro: `${uf}`, tipo: "clinica" as const, dist: 2.0 },
    { name: `Clínica de Diagnóstico Hermes Pardini – ${cidade}`, bairro: `${cidade}, ${uf}`, tipo: "clinica" as const, dist: 2.8 },
  ];
}

export async function GET(request: NextRequest) {
  const cep = request.nextUrl.searchParams.get("cep")?.replace(/\D/g, "");
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  if (!apiKey) {
    // Buscar cidade pelo CEP via ViaCEP para dar mock regionalizado
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
      // usa São Paulo como fallback
    }

    const lista = MOCK_POR_CIDADE[cidade] ?? mockGenerico(cidade, uf);

    const data = lista.map((h, i) => ({
      place_id: `mock_${cidade.replace(/\s/g, "_")}_${i}`,
      name: h.name,
      vicinity: `${h.bairro}, ${cidade}`,
      types: [h.tipo === "hospital" ? "hospital" : "doctor"],
      distance_km: h.dist,
    }));

    return NextResponse.json({ data });
  }

  // Com API key: Google Places real
  try {
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${cep},Brasil&key=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results?.[0]) {
      return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // Buscar hospitais
    const placesRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=hospital&key=${apiKey}&language=pt-BR`
    );
    const placesData = await placesRes.json();

    // Buscar clínicas/médicos
    const clinicasRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=doctor&key=${apiKey}&language=pt-BR`
    );
    const clinicasData = await clinicasRes.json();

    const mapear = (p: { place_id: string; name: string; vicinity: string; types: string[]; rating?: number; photos?: { photo_reference: string }[]; geometry: { location: { lat: number; lng: number } } }) => ({
      place_id: p.place_id,
      name: p.name,
      vicinity: p.vicinity,
      types: p.types,
      rating: p.rating,
      distance_km: calcularDistanciaKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng),
      photo_url: p.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${p.photos[0].photo_reference}&key=${apiKey}`
        : undefined,
    });

    const hospitais = (placesData.results ?? [])
      .filter((p: { name: string }) => !isPublico(p.name))
      .slice(0, 8)
      .map(mapear);

    const clinicas = (clinicasData.results ?? [])
      .filter((p: { name: string }) => !isPublico(p.name))
      .slice(0, 6)
      .map(mapear);

    const resultados = [...hospitais, ...clinicas].sort(
      (a, b) => a.distance_km - b.distance_km
    );

    return NextResponse.json({ data: resultados });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar hospitais" }, { status: 500 });
  }
}
