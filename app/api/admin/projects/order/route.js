import { NextResponse } from "next/server";
import { adminOnly, fail, readBody } from "@/lib/guard";
import { updateDb } from "@/lib/db";

// Menyimpan urutan karya di galeri (dari atas ke bawah).
export async function POST(request) {
  const blocked = await adminOnly();
  if (blocked) return blocked;

  const body = await readBody(request);
  const ids = Array.isArray(body?.ids) ? body.ids.map(String) : null;
  if (!ids) return fail("Data urutan tidak valid.");

  try {
    await updateDb((db) => {
      const byId = new Map(db.projects.map((p) => [p.id, p]));
      const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
      const rest = db.projects.filter((p) => !ids.includes(p.id));
      db.projects = [...ordered, ...rest];
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(`Gagal menyimpan urutan: ${err.message}`, 500);
  }
}
