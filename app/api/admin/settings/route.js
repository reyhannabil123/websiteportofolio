import { NextResponse } from "next/server";
import { adminOnly, fail, readBody } from "@/lib/guard";
import { updateDb } from "@/lib/db";
import { sanitizeSettings } from "@/lib/settings";
import { deleteFiles } from "@/lib/storage";

export async function PUT(request) {
  const blocked = await adminOnly();
  if (blocked) return blocked;

  const body = await readBody(request);
  if (!body || typeof body !== "object") return fail("Data tidak valid.");

  let oldImage = "";
  try {
    const settings = await updateDb((db) => {
      const next = sanitizeSettings(body, db.settings);
      oldImage = db.settings.aboutImage && db.settings.aboutImage !== next.aboutImage ? db.settings.aboutImage : "";
      db.settings = next;
      return next;
    });
    if (oldImage) await deleteFiles([oldImage]);
    return NextResponse.json(settings);
  } catch (err) {
    return fail(`Gagal menyimpan: ${err.message}`, 500);
  }
}
