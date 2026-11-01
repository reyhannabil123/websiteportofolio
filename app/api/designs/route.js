import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { isAdmin } from "@/lib/auth";
import { getDesigns, saveDesigns, isBlobUrl, cleanText } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getDesigns());
}

// Mencatat desain baru setelah gambarnya selesai diunggah ke Blob.
export async function POST(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const body = await request.json();
  if (!isBlobUrl(body?.url)) {
    return NextResponse.json({ error: "URL gambar tidak valid." }, { status: 400 });
  }

  const design = {
    id: crypto.randomUUID(),
    title: cleanText(body.title, 120) || "Tanpa judul",
    category: cleanText(body.category, 40) || "Lainnya",
    description: cleanText(body.description, 600),
    url: body.url,
    width: Number(body.width) > 0 ? Math.round(Number(body.width)) : 4,
    height: Number(body.height) > 0 ? Math.round(Number(body.height)) : 3,
    createdAt: new Date().toISOString(),
  };

  const designs = await getDesigns();
  await saveDesigns([design, ...designs]);
  return NextResponse.json(design, { status: 201 });
}
