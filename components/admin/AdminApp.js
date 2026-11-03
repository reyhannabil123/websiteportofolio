"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, discardUploads } from "@/lib/client-upload";
import ProjectsTab from "./ProjectsTab";
import SettingsTab from "./SettingsTab";
import LookTab from "./LookTab";

const TABS = [
  { id: "karya", label: "Karya" },
  { id: "teks", label: "Teks dan kontak" },
  { id: "tampilan", label: "Tampilan" },
];

export default function AdminApp({ initial, problem, localMode }) {
  const router = useRouter();
  const [tab, setTab] = useState("karya");
  const [projects, setProjects] = useState(initial.projects);
  const [saved, setSaved] = useState(initial.settings);
  const [draft, setDraft] = useState(initial.settings);
  const [status, setStatus] = useState(null); // { type: "ok" | "error", text }
  const [saving, setSaving] = useState(false);
  const uploadedAbout = useRef(new Set()); // foto "tentang" yang diunggah tapi belum disimpan

  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const notify = (type, text) => setStatus({ type, text });

  async function saveSettings() {
    setSaving(true);
    setStatus(null);
    try {
      const data = await api("/api/admin/settings", "PUT", draft);
      setSaved(data);
      setDraft(data);
      uploadedAbout.current.clear();
      notify("ok", "Perubahan disimpan dan sudah tampil di website.");
      router.refresh();
    } catch (err) {
      notify("error", err.message);
    } finally {
      setSaving(false);
    }
  }

  async function discardSettings() {
    const orphan = Array.from(uploadedAbout.current).filter((u) => u !== saved.aboutImage);
    uploadedAbout.current.clear();
    await discardUploads(orphan);
    setDraft(saved);
    setStatus(null);
  }

  async function logout() {
    try {
      await api("/api/admin/logout", "POST");
    } finally {
      window.location.reload();
    }
  }

  const showSaveBar = tab !== "karya" && dirty;

  return (
    <div className="admin">
      <header className="admin-head">
        <h1>Kelola situs</h1>
        <div className="row">
          <a className="btn" href="/" target="_blank" rel="noopener noreferrer">
            Lihat situs
          </a>
          <button className="btn" type="button" onClick={logout}>
            Keluar
          </button>
        </div>
      </header>

      {problem && (
        <p className="notice notice-error" role="alert">
          {problem}
        </p>
      )}
      {localMode && (
        <p className="notice">
          Mode lokal: data dan gambar disimpan di komputer ini (folder .local-data dan public/uploads).
          Di Vercel, semuanya otomatis disimpan di Blob.
        </p>
      )}

      <div className="tabs" role="tablist" aria-label="Bagian admin">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            className={tab === t.id ? "tab is-active" : "tab"}
            onClick={() => {
              setTab(t.id);
              setStatus(null);
            }}
          >
            {t.label}
            {t.id !== "karya" && dirty ? " •" : ""}
          </button>
        ))}
      </div>

      {status && (
        <p className={status.type === "error" ? "notice notice-error" : "notice notice-ok"} role="status">
          {status.text}
        </p>
      )}

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "karya" && (
          <ProjectsTab projects={projects} setProjects={setProjects} localMode={localMode} notify={notify} />
        )}
        {tab === "teks" && (
          <SettingsTab draft={draft} update={update} localMode={localMode} uploadedAbout={uploadedAbout} notify={notify} />
        )}
        {tab === "tampilan" && <LookTab draft={draft} update={update} />}
      </div>

      {showSaveBar && (
        <div className="savebar" role="region" aria-label="Simpan perubahan">
          <span>Ada perubahan yang belum disimpan.</span>
          <div className="row">
            <button className="btn" type="button" onClick={discardSettings} disabled={saving}>
              Batalkan
            </button>
            <button className="btn btn-primary" type="button" onClick={saveSettings} disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan perubahan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
