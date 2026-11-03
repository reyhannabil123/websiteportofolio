export function isBlobUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

// Mode lokal (hanya saat development tanpa Blob) menyimpan gambar di public/uploads.
export function isLocalUploadUrl(value) {
  return typeof value === "string" && /^\/uploads\/[A-Za-z0-9._-]+$/.test(value);
}

export function isStoredUrl(value) {
  return isBlobUrl(value) || (process.env.NODE_ENV !== "production" && isLocalUploadUrl(value));
}

export function cleanText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
