import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { adminOnly, fail, notFoundResponse } from "@/lib/guard";
import { localMode, uploadDir } from "@/lib/storage";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

// Hanya untuk mode lokal (npm run dev tanpa Blob). Di produksi route ini tidak ada.
export async function POST(request) {
  if (!localMode()) return notFoundResponse();
  const blocked = await adminOnly();
  if (blocked) return blocked;

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return fail("File tidak ditemukan.");
  const ext = TYPES[file.type];
  if (!ext) return fail("Format harus JPG, PNG, WebP, GIF, atau AVIF.");
  if (file.size > 25 * 1024 * 1024) return fail("Ukuran maksimal 25 MB per file.");

  const base = path
    .basename(file.name, path.extname(file.name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "gambar";
  const name = `${base}-${crypto.randomBytes(4).toString("hex")}.${ext}`;

  await fs.mkdir(uploadDir(), { recursive: true });
  await fs.writeFile(path.join(uploadDir(), name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${name}` });
}
