import { readJson, writeJson } from "./storage";
import { DEFAULT_SETTINGS, sanitizeSettings } from "./settings";
import { normalizeProject, oldDesignToProject, uniqueSlug } from "./projects";

// Seluruh isi situs (pengaturan + daftar karya) disimpan dalam satu file JSON.
const DB_PATH = "data/db.json";
const OLD_PATH = "data/designs.json"; // format versi pertama, dimigrasi otomatis

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

// Halaman publik memakai salinan singkat di memori server, bukan cache bawaan Next.js
// (yang terbukti tidak selalu ikut diperbarui di Vercel). Salinan ini paling lama
// berumur 15 detik, jadi perubahan dari admin pasti tampil di situs dalam hitungan detik.
const MEMO_MS = 15_000;
let memo = null; // { at, db }
let inflight = null;

export async function getDb() {
  if (memo && Date.now() - memo.at < MEMO_MS) return memo.db;
  if (!inflight) {
    inflight = readDbFresh()
      .then((db) => {
        memo = { at: Date.now(), db };
        return db;
      })
      .finally(() => {
        inflight = null;
      });
  }
  try {
    return await inflight;
  } catch (err) {
    console.error("Gagal membaca data situs:", err.message);
    // Jika penyimpanan sedang bermasalah, tampilkan data terakhir yang diketahui.
    return memo ? memo.db : emptyDb();
  }
}

// Perubahan diproses satu per satu supaya dua permintaan yang datang hampir bersamaan
// tidak saling menimpa.
let queue = Promise.resolve();

// Baca data terbaru, ubah lewat fungsi mutator, simpan, lalu perbarui salinan di memori.
export function updateDb(mutator) {
  const run = queue.then(async () => {
    const db = await readDbFresh();
    const result = await mutator(db);
    await writeJson(DB_PATH, db);
    memo = { at: Date.now(), db: JSON.parse(JSON.stringify(db)) };
    return result;
  });
  queue = run.catch(() => {});
  return run;
}
