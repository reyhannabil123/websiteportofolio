import { put, list } from "@vercel/blob";

// Daftar desain disimpan sebagai satu file JSON di Vercel Blob,
// berdampingan dengan gambar-gambarnya. Tidak perlu database terpisah.
const DB_PATH = "data/designs.json";

export async function getDesigns() {
  try {
    const { blobs } = await list({ prefix: DB_PATH });
    const file = blobs.find((b) => b.pathname === DB_PATH);
    if (!file) return [];
    const res = await fetch(`${file.url}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // Terjadi saat BLOB_READ_WRITE_TOKEN belum diisi (misalnya baru jalan di komputer sendiri).
    console.error("Gagal membaca daftar desain:", err.message);
    return [];
  }
}

export async function saveDesigns(designs) {
  await put(DB_PATH, JSON.stringify(designs), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// Hanya terima URL dari penyimpanan Blob milik Vercel.
export function isBlobUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function cleanText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}
