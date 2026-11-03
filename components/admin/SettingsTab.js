"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/client-upload";

export default function SettingsTab({ draft, update, localMode, uploadedAbout, notify }) {
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

  function setLink(index, patch) {
    update({ links: draft.links.map((l, i) => (i === index ? { ...l, ...patch } : l)) });
  }
  function addLink() {
    if (draft.links.length >= 8) return;
    update({ links: [...draft.links, { label: "", href: "https://" }] });
  }
  function removeLink(index) {
    update({ links: draft.links.filter((_, i) => i !== index) });
  }

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const img = await uploadImage(file, { optimize: true, localMode });
      uploadedAbout.current.add(img.url);
      update({ aboutImage: img.url });
    } catch (err) {
      notify("error", `Foto gagal diunggah: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="stack">
      <section className="form card">
        <h2>Identitas</h2>
        <div className="grid-2">
          <label>
            Nama
            <input type="text" value={draft.name} maxLength={60} onChange={(e) => update({ name: e.target.value })} />
          </label>
          <label>
            Profesi
            <input type="text" value={draft.role} maxLength={90} onChange={(e) => update({ role: e.target.value })} placeholder="Desainer grafis dan visual" />
          </label>
        </div>
        <label>
          Kalimat utama di bagian atas beranda
          <textarea rows={3} value={draft.tagline} maxLength={240} onChange={(e) => update({ tagline: e.target.value })} />
          <span className="hint">Satu atau dua kalimat. Ini hal pertama yang dibaca pengunjung.</span>
        </label>
      </section>

      <section className="form card">
        <h2>Tentang</h2>
        <label>
          Teks tentang Anda
          <textarea rows={7} value={draft.about} maxLength={3000} onChange={(e) => update({ about: e.target.value })} />
          <span className="hint">Pisahkan paragraf dengan satu baris kosong.</span>
        </label>

        <div className="photo-field">
          <span className="label-text">Foto (opsional)</span>
          {draft.aboutImage ? (
            <div className="photo-row">
              <img src={draft.aboutImage} alt="Foto tentang" />
              <div className="row">
                <button type="button" className="btn" onClick={() => fileInput.current?.click()} disabled={uploading}>
                  Ganti foto
                </button>
                <button type="button" className="btn" onClick={() => update({ aboutImage: "" })} disabled={uploading}>
                  Hapus foto
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button type="button" className="btn" onClick={() => fileInput.current?.click()} disabled={uploading}>
                {uploading ? "Mengunggah…" : "Pilih foto"}
              </button>
            </div>
          )}
          <input ref={fileInput} type="file" hidden accept="image/jpeg,image/png,image/webp,image/avif" onChange={onPhoto} />
        </div>
      </section>

      <section className="form card">
        <h2>Kontak</h2>
        <label>
          Judul bagian kontak
          <input type="text" value={draft.contactHeading} maxLength={60} onChange={(e) => update({ contactHeading: e.target.value })} />
        </label>
        <label>
          Email
          <input type="email" value={draft.email} maxLength={120} onChange={(e) => update({ email: e.target.value })} />
        </label>

        <div className="stack-sm">
          <span className="label-text">Tautan media sosial</span>
          {draft.links.map((l, i) => (
            <div className="link-row" key={i}>
              <input type="text" value={l.label} maxLength={40} placeholder="Nama, misalnya Instagram" aria-label={`Nama tautan ${i + 1}`} onChange={(e) => setLink(i, { label: e.target.value })} />
              <input type="url" value={l.href} maxLength={300} placeholder="https://" aria-label={`Alamat tautan ${i + 1}`} onChange={(e) => setLink(i, { href: e.target.value })} />
              <button type="button" className="btn btn-danger" onClick={() => removeLink(i)} aria-label={`Hapus tautan ${i + 1}`}>
                Hapus
              </button>
            </div>
          ))}
          <div>
            <button type="button" className="btn" onClick={addLink} disabled={draft.links.length >= 8}>
              Tambah tautan
            </button>
          </div>
          <span className="hint">Tautan tanpa nama atau tanpa alamat https:// otomatis diabaikan saat disimpan.</span>
        </div>
      </section>

      <section className="form card">
        <h2>Bagian bawah dan mesin pencari</h2>
        <label>
          Teks footer
          <input type="text" value={draft.footerText} maxLength={120} onChange={(e) => update({ footerText: e.target.value })} placeholder="Kosongkan untuk © tahun dan nama Anda" />
        </label>
        <label>
          Judul di tab browser dan Google
          <input type="text" value={draft.seoTitle} maxLength={90} onChange={(e) => update({ seoTitle: e.target.value })} placeholder="Kosongkan untuk memakai nama dan profesi" />
        </label>
        <label>
          Deskripsi singkat untuk Google
          <textarea rows={2} value={draft.seoDescription} maxLength={200} onChange={(e) => update({ seoDescription: e.target.value })} placeholder="Kosongkan untuk memakai kalimat utama" />
        </label>
      </section>
    </div>
  );
}
