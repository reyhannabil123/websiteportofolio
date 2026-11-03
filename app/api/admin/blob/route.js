import { NextResponse } from "next/server";
import { adminOnly, readBody } from "@/lib/guard";
import { readDbFresh } from "@/lib/db";
import { deleteFiles } from "@/lib/storage";

// Menghapus gambar yang sudah diunggah tapi akhirnya tidak dipakai (misalnya form dibatalkan).
// Gambar yang masih dipakai karya atau pengaturan tidak akan pernah dihapus lewat route ini.
export async function DELETE(request) {
  const blocked = await adminOnly();
  if (blocked) return blocked;

  const body = await readBody(request);
  const urls = Array.isArray(body?.urls) ? body.urls.filter((u) => typeof u === "string") : [];
  if (urls.length === 0) return NextResponse.json({ ok: true, deleted: 0 });

  const db = await readDbFresh();
  const inUse = new Set(db.projects.flatMap((p) => p.images.map((i) => i.url)));
  if (db.settings.aboutImage) inUse.add(db.settings.aboutImage);

  const safe = urls.filter((u) => !inUse.has(u));
  await deleteFiles(safe);
  return NextResponse.json({ ok: true, deleted: safe.length });
}
