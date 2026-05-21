import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tipo = formData.get("tipo") as string;
    const cotacaoId = formData.get("cotacaoId") as string | null;

    if (!file || !tipo) {
      return NextResponse.json({ error: "Arquivo e tipo obrigatórios" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Arquivo muito grande (máx 10 MB)" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato não suportado. Use JPG, PNG ou PDF" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${cotacaoId ?? "anon"}/${tipo}_${Date.now()}.${ext}`;

    const bytes = await file.arrayBuffer();
    const { data, error: uploadErr } = await supabase.storage
      .from("documentos")
      .upload(path, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage
      .from("documentos")
      .getPublicUrl(path);

    // Salvar referência no banco
    if (cotacaoId) {
      await supabase.from("documentos").insert({
        cotacao_id: cotacaoId,
        tipo: tipo as never,
        url_storage: data.path,
        nome_arquivo: file.name,
        tamanho_bytes: file.size,
      });
    }

    return NextResponse.json({ path: data.path, url: urlData.publicUrl });
  } catch (err) {
    console.error("Erro no upload:", err);
    return NextResponse.json({ error: "Erro ao enviar arquivo" }, { status: 500 });
  }
}
