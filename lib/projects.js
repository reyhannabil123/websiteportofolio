import { cleanText, isStoredUrl } from "./util";

export const MAX_IMAGES = 20;

export function slugify(text) {
  return (
    String(text ?? "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "karya"
  );
}

export function uniqueSlug(base, projects, selfId) {
  const root = slugify(base);
  const taken = (s) => projects.some((p) => p.slug === s && p.id !== selfId);
  let slug = root;
  let n = 2;
  while (taken(slug)) slug = `${root}-${n++}`;
  return slug;
}

function posInt(value, fallback) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n > 0 && n < 100000 ? n : fallback;
}

export function normalizeImages(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((i) => i && isStoredUrl(i.url))
    .slice(0, MAX_IMAGES)
    .map((i) => ({ url: i.url, width: posInt(i.width, 4), height: posInt(i.height, 5) }));
}

// Dipakai saat membaca data tersimpan. Proyek tanpa gambar dibuang.
export function normalizeProject(p) {
  if (!p || typeof p !== "object" || !p.id) return null;
  const images = normalizeImages(p.images);
  if (images.length === 0) return null;
  const created = typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString();
  return {
    id: String(p.id),
    slug: slugify(p.slug || p.title),
    title: cleanText(p.title, 120) || "Tanpa judul",
    client: cleanText(p.client, 80),
    category: cleanText(p.category, 40),
    year: cleanText(p.year, 12),
    description: String(p.description ?? "").trim().slice(0, 2000),
    images,
    visible: p.visible !== false,
    createdAt: created,
    updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : created,
  };
}

// Dipakai untuk data dari form admin. Mengembalikan { error } atau { value }.
export function sanitizeProjectInput(body) {
  if (!body || typeof body !== "object") return { error: "Data tidak valid." };
  const title = cleanText(body.title, 120);
  if (!title) return { error: "Judul wajib diisi." };
  const images = normalizeImages(body.images);
  if (images.length === 0) return { error: "Tambahkan minimal satu gambar." };
  return {
    value: {
      title,
      client: cleanText(body.client, 80),
      category: cleanText(body.category, 40),
      year: cleanText(body.year, 12),
      description: String(body.description ?? "").trim().slice(0, 2000),
      images,
      visible: body.visible !== false,
    },
  };
}

// Mengubah data versi lama (satu desain = satu gambar) menjadi proyek.
export function oldDesignToProject(d) {
  if (!d || !d.url) return null;
  return normalizeProject({
    id: d.id,
    slug: slugify(d.title),
    title: d.title,
    category: d.category,
    description: d.description,
    images: [{ url: d.url, width: d.width, height: d.height }],
    visible: true,
    createdAt: d.createdAt,
  });
}
