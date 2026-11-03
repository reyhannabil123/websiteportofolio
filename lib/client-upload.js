// Dipakai di browser (panel admin). Tidak boleh mengimpor apa pun dari lib server.
import { upload } from "@vercel/blob/client";

async function readSize(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close?.();
    return size;
  } catch {
    return { width: 4, height: 5 };
  }
}

// Memperkecil gambar besar (maks. sisi terpanjang 2400 px) dan mengubahnya ke WebP.
// Hasilnya jauh lebih ringan, jadi halaman cepat dibuka dan kuota penyimpanan hemat.
// GIF dan SVG dilewati supaya animasinya tidak hilang.
export async function optimizeImage(file, maxEdge = 2400) {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
    if (!blob || blob.type !== "image/webp") return file;
    if (scale === 1 && blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

function safeName(name) {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "gambar";
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  return `${base}.${ext || "jpg"}`;
}

// Mengunggah satu gambar dan mengembalikan { url, width, height }.
export async function uploadImage(file, { optimize = true, localMode = false, onProgress } = {}) {
  const prepared = optimize ? await optimizeImage(file) : file;
  const size = await readSize(prepared);

  if (localMode) {
    const form = new FormData();
    form.append("file", prepared, safeName(prepared.name));
    const res = await fetch("/api/admin/upload-local", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload gagal.");
    onProgress?.(100);
    return { url: data.url, ...size };
  }

  const blob = await upload(`media/${safeName(prepared.name)}`, prepared, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
    multipart: prepared.size > 8 * 1024 * 1024,
    onUploadProgress: ({ percentage }) => onProgress?.(Math.round(percentage)),
  });
  return { url: blob.url, ...size };
}

export async function discardUploads(urls) {
  const list = Array.from(urls || []);
  if (list.length === 0) return;
  try {
    await fetch("/api/admin/blob", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: list }),
    });
  } catch {
    /* dibiarkan, hanya pembersihan */
  }
}

export async function api(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Permintaan gagal (${res.status}).`);
  return data;
}
