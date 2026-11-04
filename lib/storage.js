import { put, list, del } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";
import { isBlobUrl, isLocalUploadUrl } from "./util";

// Mode lokal: aktif otomatis saat `npm run dev` dan BLOB_READ_WRITE_TOKEN kosong.
// Data disimpan di folder .local-data dan gambar di public/uploads, jadi admin bisa
// dicoba penuh di komputer sendiri tanpa akun Vercel. Tidak pernah aktif di produksi.
export function localMode() {
  return process.env.NODE_ENV !== "production" && !process.env.BLOB_READ_WRITE_TOKEN;
}

const localDir = () => path.join(process.cwd(), ".local-data");
export const uploadDir = () => path.join(process.cwd(), "public", "uploads");

export async function readJson(pathname) {
  if (localMode()) {
    try {
      return JSON.parse(await fs.readFile(path.join(localDir(), pathname), "utf8"));
    } catch (err) {
      if (err.code === "ENOENT") return null;
      throw err;
    }
  }
  // Jalur cepat: alamat file Blob bisa disusun langsung dari ID store di token, jadi
  // pembacaan tidak memakai operasi "list" (kuota gratisnya hanya 2.000 per bulan).
  const base = blobBaseUrl();
  if (base) {
    const res = await fetch(`${base}/${pathname}?t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) return res.json();
    if (res.status !== 404) throw new Error(`Gagal membaca ${pathname} (status ${res.status}).`);
  }
  // Cadangan (dan saat file belum ada): cari lewat daftar file.
  const { blobs } = await list({ prefix: pathname });
  const file = blobs.find((b) => b.pathname === pathname);
  if (!file) return null;
  const res = await fetch(`${file.url}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Gagal membaca ${pathname} (status ${res.status}).`);
  return res.json();
}

function blobBaseUrl() {
  const storeId = (process.env.BLOB_READ_WRITE_TOKEN || "").split("_")[3];
  return storeId ? `https://${storeId}.public.blob.vercel-storage.com` : null;
}

export async function writeJson(pathname, data) {
  const body = JSON.stringify(data);
  if (localMode()) {
    const file = path.join(localDir(), pathname);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body, "utf8");
    return;
  }
  await put(pathname, body, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
}

export async function deleteFiles(urls) {
  const all = [...new Set((urls || []).filter(Boolean))];
  const blobUrls = all.filter(isBlobUrl);
  if (blobUrls.length) {
    try {
      await del(blobUrls);
    } catch (err) {
      console.error("Gagal menghapus file di Blob:", err.message);
    }
  }
  if (localMode()) {
    for (const u of all.filter(isLocalUploadUrl)) {
      try {
        await fs.unlink(path.join(uploadDir(), path.basename(u)));
      } catch {
        /* file sudah tidak ada */
      }
    }
  }
}
