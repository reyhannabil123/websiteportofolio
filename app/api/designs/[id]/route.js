import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";
import { getDesigns, saveDesigns, cleanText } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  const designs = await getDesigns();
  const index = designs.findIndex((d) => d.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Desain tidak ditemukan." }, { status: 404 });
  }

  const current = designs[index];
  designs[index] = {
    ...current,
    title: cleanText(body.title ?? current.title, 120) || current.title,
    category: cleanText(body.category ?? current.category, 40) || current.category,
    description: cleanText(body.description ?? current.description, 600),
  };
  await saveDesigns(designs);
  return NextResponse.json(designs[index]);
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;

  const designs = await getDesigns();
  const target = designs.find((d) => d.id === id);
  if (!target) {
    return NextResponse.json({ error: "Desain tidak ditemukan." }, { status: 404 });
  }

  await saveDesigns(designs.filter((d) => d.id !== id));
  try {
    await del(target.url); // hapus file gambarnya juga agar kuota penyimpanan tidak terbuang
  } catch (err) {
    console.error("Gagal menghapus file gambar:", err.message);
  }
  return NextResponse.json({ ok: true });
}
