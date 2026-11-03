import { NextResponse } from "next/server";
import { adminOnly, fail, readBody } from "@/lib/guard";
import { updateDb } from "@/lib/db";
import { sanitizeProjectInput } from "@/lib/projects";
import { deleteFiles } from "@/lib/storage";

export async function PATCH(request, { params }) {
  const blocked = await adminOnly();
  if (blocked) return blocked;
  const { id } = await params;

  const input = sanitizeProjectInput(await readBody(request));
  if (input.error) return fail(input.error);

  let removed = [];
  try {
    const project = await updateDb((db) => {
      const index = db.projects.findIndex((p) => p.id === id);
      if (index === -1) return null;
      const current = db.projects[index];
      // Alamat (slug) tidak berubah saat judul diganti, supaya link yang sudah dibagikan tetap hidup.
      const next = { ...current, ...input.value, updatedAt: new Date().toISOString() };
      removed = current.images
        .map((i) => i.url)
        .filter((u) => !next.images.some((n) => n.url === u));
      db.projects[index] = next;
      return next;
    });
    if (!project) return fail("Karya tidak ditemukan.", 404);
    await deleteFiles(removed);
    return NextResponse.json(project);
  } catch (err) {
    return fail(`Gagal menyimpan: ${err.message}`, 500);
  }
}

export async function DELETE(_request, { params }) {
  const blocked = await adminOnly();
  if (blocked) return blocked;
  const { id } = await params;

  let urls = [];
  try {
    const found = await updateDb((db) => {
      const target = db.projects.find((p) => p.id === id);
      if (!target) return false;
      urls = target.images.map((i) => i.url);
      db.projects = db.projects.filter((p) => p.id !== id);
      return true;
    });
    if (!found) return fail("Karya tidak ditemukan.", 404);
    await deleteFiles(urls);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(`Gagal menghapus: ${err.message}`, 500);
  }
}
