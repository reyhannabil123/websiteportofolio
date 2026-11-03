"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/client-upload";
import ProjectEditor from "./ProjectEditor";

export default function ProjectsTab({ projects, setProjects, localMode, notify }) {
  const [editing, setEditing] = useState(null); // null | "new" | project
  const saveChain = useRef(Promise.resolve());

  function move(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= projects.length) return;
    const next = projects.slice();
    [next[index], next[target]] = [next[target], next[index]];
    const before = projects;
    setProjects(next);
    // Simpan berurutan, sehingga klik cepat berkali-kali selalu berakhir di urutan terakhir.
    saveChain.current = saveChain.current
      .then(() => api("/api/admin/projects/order", "POST", { ids: next.map((p) => p.id) }))
      .catch((err) => {
        setProjects(before);
        notify("error", err.message);
      });
  }

  async function remove(p) {
    const ok = window.confirm(
      `Hapus "${p.title}" beserta ${p.images.length} gambarnya dari website? Tindakan ini tidak bisa dibatalkan.`
    );
    if (!ok) return;
    try {
      await api(`/api/admin/projects/${p.id}`, "DELETE");
      setProjects((list) => list.filter((x) => x.id !== p.id));
      notify("ok", `"${p.title}" sudah dihapus.`);
    } catch (err) {
      notify("error", err.message);
    }
  }

  function onSaved(project, isNew) {
    setProjects((list) =>
      isNew ? [project, ...list] : list.map((p) => (p.id === project.id ? project : p))
    );
    setEditing(null);
    notify("ok", isNew ? "Karya baru sudah tampil di website." : "Perubahan karya disimpan.");
  }

  if (editing) {
    return (
      <ProjectEditor
        project={editing === "new" ? null : editing}
        localMode={localMode}
        onSaved={onSaved}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <section className="stack">
      <div className="section-head">
        <h2>Karya ({projects.length})</h2>
        <button className="btn btn-primary" type="button" onClick={() => setEditing("new")}>
          Tambah karya
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="hint">
          Belum ada karya. Klik &quot;Tambah karya&quot;, lalu unggah satu atau beberapa gambar, misalnya tiga mockup
          untuk satu klien.
        </p>
      ) : (
        <ul className="plist">
          {projects.map((p, i) => (
            <li key={p.id} className="prow">
              <img src={p.images[0].url} alt="" loading="lazy" />
              <div className="prow-main">
                <strong>{p.title}</strong>
                <span className="muted">
                  {[p.client, p.category].filter(Boolean).join(", ") || "Tanpa klien dan kategori"}
                </span>
                <span className="muted">
                  {p.images.length} gambar
                  {!p.visible && " — disembunyikan dari website"}
                </span>
              </div>
              <div className="prow-actions">
                <button className="icon-btn" type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Naikkan ${p.title}`}>
                  ↑
                </button>
                <button className="icon-btn" type="button" onClick={() => move(i, 1)} disabled={i === projects.length - 1} aria-label={`Turunkan ${p.title}`}>
                  ↓
                </button>
                <button className="btn" type="button" onClick={() => setEditing(p)}>
                  Ubah
                </button>
                <button className="btn btn-danger" type="button" onClick={() => remove(p)}>
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {projects.length > 1 && <p className="hint">Urutan di sini sama dengan urutan di website, dari kiri atas.</p>}
    </section>
  );
}
