import { unstable_cache, revalidateTag } from "next/cache";
import { readJson, writeJson } from "./storage";
import { DEFAULT_SETTINGS, sanitizeSettings } from "./settings";
import { normalizeProject, oldDesignToProject, uniqueSlug } from "./projects";

// Seluruh isi situs (pengaturan + daftar karya) disimpan dalam satu file JSON.
const DB_PATH = "data/db.json";
const OLD_PATH = "data/designs.json"; // format versi pertama, dimigrasi otomatis
export const DB_TAG = "site-db";

export function emptyDb() {
  return { settings: { ...DEFAULT_SETTINGS }, projects: [] };
}

function normalizeDb(raw) {
  const db = raw && typeof raw === "object" ? raw : {};
  const projects = [];
  for (const item of Array.isArray(db.projects) ? db.projects : []) {
    const p = normalizeProject(item);
    if (!p) continue;
    p.slug = uniqueSlug(p.slug, projects, p.id);
    projects.push(p);
  }
  return { settings: sanitizeSettings(db.settings || {}, DEFAULT_SETTINGS), projects };
}

// Selalu membaca data terbaru (tanpa cache). Dipakai admin dan sebelum menulis.
export async function readDbFresh() {
  const raw = await readJson(DB_PATH);
  if (raw) return normalizeDb(raw);

  const old = await readJson(OLD_PATH);
  if (Array.isArray(old)) {
    return normalizeDb({ settings: {}, projects: old.map(oldDesignToProject).filter(Boolean) });
  }
  return emptyDb();
}

const cachedRead = unstable_cache(async () => readDbFresh(), ["site-db"], {
  tags: [DB_TAG],
  revalidate: 300,
});

// Dipakai halaman publik: di-cache supaya cepat dan hemat kuota, dan dibuat ulang
// otomatis setiap kali admin menyimpan sesuatu.
export async function getDb() {
  try {
    return await cachedRead();
  } catch (err) {
    console.error("Gagal membaca data situs:", err.message);
    return emptyDb();
  }
}

// Perubahan diproses satu per satu supaya dua permintaan yang datang hampir bersamaan
// tidak saling menimpa.
let queue = Promise.resolve();

// Baca data terbaru, ubah lewat fungsi mutator, simpan, lalu segarkan cache.
export function updateDb(mutator) {
  const run = queue.then(async () => {
    const db = await readDbFresh();
    const result = await mutator(db);
    await writeJson(DB_PATH, db);
    revalidateTag(DB_TAG);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}
