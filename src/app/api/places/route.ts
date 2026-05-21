import { NextRequest, NextResponse } from "next/server";

interface ViaCEPResponse {
  logradouro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  types: string[];
  rating?: number;
  photos?: { photo_reference: string }[];
  geometry: { location: { lat: number; lng: number } };
}

interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
}

function calcularDistanciaKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
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

export async function GET(request: NextRequest) {
  const cep = request.nextUrl.searchParams.get("cep")?.replace(/\D/g, "");
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  if (!apiKey) {
    // Retornar dados fictícios quando não há API key (desenvolvimento)
    return NextResponse.json({
      data: [
        {
          place_id: "mock_1",
          name: "Hospital Municipal Central",
          vicinity: "Centro, São Paulo",
          types: ["hospital"],
          distance_km: 1.2,
          rating: 4.2,
        },
        {
          place_id: "mock_2",
          name: "UPA 24h Norte",
          vicinity: "Vila Norte, São Paulo",
          types: ["hospital"],
          distance_km: 2.8,
          rating: 3.9,
        },
        {
          place_id: "mock_3",
          name: "Clínica São Lucas",
          vicinity: "Jardim América, São Paulo",
          types: ["doctor"],
          distance_km: 0.9,
          rating: 4.7,
        },
        {
          place_id: "mock_4",
          name: "Laboratório Fleury",
          vicinity: "Av. Paulista, São Paulo",
          types: ["health"],
          distance_km: 3.1,
          rating: 4.5,
        },
      ],
    });
  }

  try {
    // Geocodificar o CEP
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${cep},Brasil&key=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results?.[0]) {
      return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // Buscar hospitais e clínicas próximos
    const placesRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=hospital&key=${apiKey}&language=pt-BR`
    );
    const placesData: GooglePlacesResponse = await placesRes.json();

    const resultados = (placesData.results ?? []).slice(0, 15).map((p) => ({
      place_id: p.place_id,
      name: p.name,
      vicinity: p.vicinity,
      types: p.types,
      rating: p.rating,
      distance_km: calcularDistanciaKm(
        lat,
        lng,
        p.geometry.location.lat,
        p.geometry.location.lng
      ),
      photo_url: p.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${p.photos[0].photo_reference}&key=${apiKey}`
        : undefined,
    }));

    resultados.sort((a, b) => a.distance_km - b.distance_km);

    return NextResponse.json({ data: resultados });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao buscar hospitais" },
      { status: 500 }
    );
  }
}
