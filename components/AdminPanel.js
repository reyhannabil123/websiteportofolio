"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

function readSize(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 4, height: 3 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function titleFromFilename(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export default function AdminPanel({ initialDesigns, suggestions, tokenMissing }) {
  const [designs, setDesigns] = useState(initialDesigns);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [progress, setProgress] = useState(null); // { done, total, percent }
  const [editingId, setEditingId] = useState(null);
  const fileInput = useRef(null);

  const busy = progress !== null;

  async function onUpload(e) {
    e.preventDefault();
    if (files.length === 0) {
      setStatus({ type: "error", text: "Pilih minimal satu gambar dulu." });
      return;
    }
    setStatus({ type: "", text: "" });

    const added = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ done: i, total: files.length, percent: 0 });

        const size = await readSize(file);
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          onUploadProgress: ({ percentage }) =>
            setProgress({ done: i, total: files.length, percent: Math.round(percentage) }),
        });

        const res = await fetch("/api/designs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: blob.url,
            title: files.length === 1 && title.trim() ? title : titleFromFilename(file.name),
            category,
            description: files.length === 1 ? description : "",
            ...size,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan data desain.");
        added.unshift(data);
      }

      setDesigns((prev) => [...added, ...prev]);
      setFiles([]);
      setTitle("");
      setDescription("");
      setCategory("");
      if (fileInput.current) fileInput.current.value = "";
      setStatus({
        type: "ok",
        text: `${added.length} desain berhasil diunggah dan sudah tampil di website.`,
      });
    } catch (err) {
      if (added.length) setDesigns((prev) => [...added, ...prev]);
      setStatus({ type: "error", text: `Upload berhenti: ${err.message}` });
    } finally {
      setProgress(null);
    }
  }

  async function onDelete(d) {
    if (!window.confirm(`Hapus "${d.title}" dari website? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await fetch(`/api/designs/${d.id}`, { method: "DELETE" });
    if (res.ok) {
      setDesigns((prev) => prev.filter((x) => x.id !== d.id));
      setStatus({ type: "ok", text: `"${d.title}" sudah dihapus.` });
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus({ type: "error", text: data.error || "Gagal menghapus." });
    }
  }

  async function onSaveEdit(e, d) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/designs/${d.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        category: form.get("category"),
        description: form.get("description"),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setDesigns((prev) => prev.map((x) => (x.id === d.id ? data : x)));
      setEditingId(null);
      setStatus({ type: "ok", text: "Perubahan disimpan." });
    } else {
      setStatus({ type: "error", text: data.error || "Gagal menyimpan perubahan." });
    }
  }

  async function onLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      <div className="admin-top">
        <h1>Kelola karya</h1>
        <div className="admin-top-actions">
          <a className="btn" href="/" target="_blank" rel="noopener noreferrer">
            Lihat website
          </a>
          <button className="btn" type="button" onClick={onLogout}>
            Keluar
          </button>
        </div>
      </div>

      {tokenMissing && (
        <p className="notice notice-error" role="alert">
          BLOB_READ_WRITE_TOKEN belum terisi, jadi upload belum bisa berjalan. Buat Blob store di
          dashboard Vercel dan hubungkan ke project ini. Langkahnya ada di README.
        </p>
      )}

      <section className="panel" aria-labelledby="upload-title">
        <h2 id="upload-title">Unggah desain baru</h2>
        <form className="form" onSubmit={onUpload}>
          <label>
            Gambar (JPG, PNG, WebP, GIF, AVIF; maks. 25 MB per file)
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              disabled={busy}
            />
          </label>

          {files.length === 1 && (
            <label>
              Judul
              <input
                type="text"
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={titleFromFilename(files[0].name)}
                disabled={busy}
              />
            </label>
          )}
          {files.length > 1 && (
            <p className="hint">
              {files.length} file dipilih. Judul diambil dari nama file, dan kategori di bawah berlaku
              untuk semuanya. Anda bisa mengubah judul setelah upload.
            </p>
          )}

          <label>
            Kategori
            <input
              type="text"
              list="category-suggestions"
              maxLength={40}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Misalnya Branding"
              disabled={busy}
            />
            <datalist id="category-suggestions">
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>

          {files.length <= 1 && (
            <label>
              Keterangan (opsional)
              <textarea
                rows={3}
                maxLength={600}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Klien, alat yang dipakai, atau cerita singkat di balik desain ini"
                disabled={busy}
              />
            </label>
          )}

          {progress && (
            <div className="progress" role="status">
              <div className="progress-bar" style={{ width: `${progress.percent}%` }} />
              <span>
                Mengunggah file {progress.done + 1} dari {progress.total} ({progress.percent}%)
              </span>
            </div>
          )}

          {status.text && (
            <p className={status.type === "error" ? "notice notice-error" : "notice notice-ok"} role="status">
              {status.text}
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Mengunggah…" : "Unggah"}
          </button>
        </form>
      </section>

      <section className="panel" aria-labelledby="list-title">
        <h2 id="list-title">Karya yang tampil ({designs.length})</h2>

        {designs.length === 0 ? (
          <p className="hint">Belum ada desain. Unggah yang pertama lewat form di atas.</p>
        ) : (
          <ul className="admin-list">
            {designs.map((d) => (
              <li key={d.id} className="admin-item">
                <img src={d.url} alt="" loading="lazy" />
                {editingId === d.id ? (
                  <form className="form admin-edit" onSubmit={(e) => onSaveEdit(e, d)}>
                    <label>
                      Judul
                      <input name="title" defaultValue={d.title} maxLength={120} required />
                    </label>
                    <label>
                      Kategori
                      <input name="category" defaultValue={d.category} maxLength={40} list="category-suggestions" />
                    </label>
                    <label>
                      Keterangan
                      <textarea name="description" defaultValue={d.description} rows={2} maxLength={600} />
                    </label>
                    <div className="row">
                      <button className="btn btn-primary" type="submit">
                        Simpan
                      </button>
                      <button className="btn" type="button" onClick={() => setEditingId(null)}>
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="admin-meta">
                    <strong>{d.title}</strong>
                    <span>{d.category}</span>
                    <div className="row">
                      <button className="btn" type="button" onClick={() => setEditingId(d.id)}>
                        Ubah
                      </button>
                      <button className="btn btn-danger" type="button" onClick={() => onDelete(d)}>
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
