"use client";

import { useRef, useState } from "react";
import { api, discardUploads, uploadImage } from "@/lib/client-upload";
import { siteCategorySuggestions } from "./suggestions";

const MAX_IMAGES = 20;

export default function ProjectEditor({ project, localMode, onSaved, onCancel }) {
  const isNew = !project;
  const [form, setForm] = useState({
    title: project?.title ?? "",
    client: project?.client ?? "",
    category: project?.category ?? "",
    year: project?.year ?? String(new Date().getFullYear()),
    description: project?.description ?? "",
    visible: project?.visible ?? true,
  });
  const [images, setImages] = useState(project?.images ?? []);
  const [optimize, setOptimize] = useState(true);
  const [uploading, setUploading] = useState(null); // { name, index, total, percent }
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fresh = useRef(new Set()); // gambar baru yang belum tersimpan di server
  const fileInput = useRef(null);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const busy = uploading !== null || saving;

  async function onPick(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setError("");

    const room = MAX_IMAGES - images.length;
    const queue = files.slice(0, Math.max(room, 0));
    if (files.length > queue.length) setError(`Maksimal ${MAX_IMAGES} gambar per karya. Sisanya dilewati.`);

    for (let i = 0; i < queue.length; i++) {
      const file = queue[i];
      setUploading({ name: file.name, index: i + 1, total: queue.length, percent: 0 });
      try {
        const img = await uploadImage(file, {
          optimize,
          localMode,
          onProgress: (percent) => setUploading((u) => (u ? { ...u, percent } : u)),
        });
        fresh.current.add(img.url);
        setImages((list) => [...list, img]);
      } catch (err) {
        setError(`"${file.name}" gagal diunggah: ${err.message}`);
      }
    }
    setUploading(null);
  }

  function moveImage(index, dir) {
    const target = index + dir;
    setImages((list) => {
      if (target < 0 || target >= list.length) return list;
      const next = list.slice();
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function removeImage(index) {
    const img = images[index];
    setImages((list) => list.filter((_, i) => i !== index));
    // Gambar yang baru diunggah dan belum pernah disimpan langsung dibuang dari penyimpanan.
    if (fresh.current.has(img.url)) {
      fresh.current.delete(img.url);
      await discardUploads([img.url]);
    }
  }

  async function cancel() {
    await discardUploads(fresh.current);
    fresh.current.clear();
    onCancel();
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Judul wajib diisi.");
    if (images.length === 0) return setError("Tambahkan minimal satu gambar.");

    setSaving(true);
    try {
      const payload = { ...form, images };
      const data = isNew
        ? await api("/api/admin/projects", "POST", payload)
        : await api(`/api/admin/projects/${project.id}`, "PATCH", payload);
      fresh.current.clear();
      onSaved(data, isNew);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className="stack editor" onSubmit={save}>
      <div className="section-head">
        <h2>{isNew ? "Karya baru" : "Ubah karya"}</h2>
        <button className="btn" type="button" onClick={cancel} disabled={saving}>
          Batal
        </button>
      </div>

      <div className="form">
        <label>
          Judul karya
          <input type="text" value={form.title} maxLength={120} onChange={(e) => set("title", e.target.value)} placeholder="Contoh: Identitas visual Kopi Senja" required />
        </label>

        <div className="grid-2">
          <label>
            Nama klien
            <input type="text" value={form.client} maxLength={80} onChange={(e) => set("client", e.target.value)} placeholder="Contoh: Kopi Senja" />
          </label>
          <label>
            Kategori
            <input type="text" list="cat-suggestions" value={form.category} maxLength={40} onChange={(e) => set("category", e.target.value)} placeholder="Contoh: Branding" />
            <datalist id="cat-suggestions">
              {siteCategorySuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
        </div>

        <label className="short">
          Tahun
          <input type="text" value={form.year} maxLength={12} onChange={(e) => set("year", e.target.value)} />
        </label>

        <label>
          Keterangan (opsional)
          <textarea rows={4} value={form.description} maxLength={2000} onChange={(e) => set("description", e.target.value)} placeholder="Tantangan, peran Anda, dan hasil akhirnya. Pisahkan paragraf dengan satu baris kosong." />
        </label>
      </div>

      <div className="stack-sm">
        <div className="section-head">
          <h3>Gambar ({images.length})</h3>
          <button className="btn" type="button" onClick={() => fileInput.current?.click()} disabled={busy || images.length >= MAX_IMAGES}>
            Tambah gambar
          </button>
        </div>
        <input ref={fileInput} type="file" hidden multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={onPick} />

        <p className="hint">
          Gambar pertama jadi sampul di galeri. Pengunjung menggesernya berurutan seperti carousel Instagram,
          jadi susun urutannya di sini. Anda bisa memilih beberapa file sekaligus.
        </p>

        <label className="check">
          <input type="checkbox" checked={optimize} onChange={(e) => setOptimize(e.target.checked)} disabled={busy} />
          <span>
            Perkecil dan ringankan gambar otomatis (disarankan). Sisi terpanjang jadi maksimal 2400 px, format
            WebP. Matikan kalau Anda ingin file persis seperti aslinya.
          </span>
        </label>

        {images.length === 0 && !uploading && (
          <button type="button" className="dropzone" onClick={() => fileInput.current?.click()}>
            Klik untuk memilih gambar. JPG, PNG, WebP, GIF, atau AVIF, maksimal 25 MB per file.
          </button>
        )}

        {images.length > 0 && (
          <ol className="thumbs">
            {images.map((img, i) => (
              <li key={img.url} className="thumb">
                <div className="thumb-img">
                  <img src={img.url} alt={`Gambar ${i + 1}`} />
                  {i === 0 && <span className="badge">Sampul</span>}
                </div>
                <div className="thumb-actions">
                  <button type="button" className="icon-btn" onClick={() => moveImage(i, -1)} disabled={i === 0 || busy} aria-label={`Geser gambar ${i + 1} ke kiri`}>
                    ←
                  </button>
                  <button type="button" className="icon-btn" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1 || busy} aria-label={`Geser gambar ${i + 1} ke kanan`}>
                    →
                  </button>
                  <button type="button" className="icon-btn icon-danger" onClick={() => removeImage(i)} disabled={busy} aria-label={`Hapus gambar ${i + 1}`}>
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        {uploading && (
          <div className="progress" role="status">
            <div className="progress-bar" style={{ width: `${uploading.percent}%` }} />
            <span>
              Mengunggah {uploading.index} dari {uploading.total}: {uploading.name} ({uploading.percent}%)
            </span>
          </div>
        )}
      </div>

      <label className="check">
        <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} />
        <span>Tampilkan di website. Matikan untuk menyimpannya sebagai draf.</span>
      </label>

      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}

      <div className="row">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {saving ? "Menyimpan…" : isNew ? "Terbitkan karya" : "Simpan perubahan"}
        </button>
        <button className="btn" type="button" onClick={cancel} disabled={saving}>
          Batal
        </button>
      </div>
    </form>
  );
}
