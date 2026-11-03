"use client";

const FONTS = [
  { id: "elegan", name: "Elegan", note: "Judul bergaya serif, teks sans-serif", head: "var(--serif)", body: "var(--sans)" },
  { id: "modern", name: "Modern", note: "Sans-serif bersih di seluruh halaman", head: "var(--sans)", body: "var(--sans)" },
  { id: "klasik", name: "Klasik", note: "Serif di seluruh halaman, terasa seperti buku", head: "var(--serif)", body: "var(--serif)" },
];

const RATIOS = [
  { id: "4:5", label: "Potret 4:5" },
  { id: "1:1", label: "Persegi 1:1" },
  { id: "3:2", label: "Lanskap 3:2" },
  { id: "asli", label: "Ukuran asli gambar" },
];

export default function LookTab({ draft, update }) {
  return (
    <div className="stack">
      <section className="form card">
        <h2>Tema warna</h2>
        <div className="choices" role="radiogroup" aria-label="Tema warna">
          {[
            { id: "light", label: "Terang" },
            { id: "dark", label: "Gelap" },
          ].map((t) => (
            <label key={t.id} className={draft.theme === t.id ? "choice is-on" : "choice"}>
              <input type="radio" name="theme" checked={draft.theme === t.id} onChange={() => update({ theme: t.id })} />
              <span className={`swatch swatch-${t.id}`} aria-hidden="true">
                Aa
              </span>
              <span>{t.label}</span>
            </label>
          ))}
        </div>

        <div className="accent-row">
          <label className="inline">
            Warna aksen
            <input type="color" value={draft.accent || "#171717"} onChange={(e) => update({ accent: e.target.value })} aria-label="Pilih warna aksen" />
          </label>
          <button type="button" className="btn" onClick={() => update({ accent: "" })} disabled={!draft.accent}>
            Ikuti warna teks
          </button>
        </div>
        <p className="hint">
          Aksen dipakai untuk tautan yang disorot dan garis fokus. Untuk tampilan paling tenang, biarkan mengikuti
          warna teks.
        </p>
      </section>

      <section className="form card">
        <h2>Gaya huruf</h2>
        <div className="choices choices-col" role="radiogroup" aria-label="Gaya huruf">
          {FONTS.map((f) => (
            <label key={f.id} className={draft.fontStyle === f.id ? "choice choice-wide is-on" : "choice choice-wide"}>
              <input type="radio" name="font" checked={draft.fontStyle === f.id} onChange={() => update({ fontStyle: f.id })} />
              <span className="font-sample" style={{ fontFamily: f.head }}>
                Rancang dengan teliti
              </span>
              <span className="font-note" style={{ fontFamily: f.body }}>
                <strong>{f.name}</strong> — {f.note}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="form card">
        <h2>Galeri karya</h2>

        <fieldset className="fieldset">
          <legend>Jumlah kolom di layar lebar</legend>
          <div className="choices">
            {[2, 3, 4].map((n) => (
              <label key={n} className={draft.columns === n ? "choice is-on" : "choice"}>
                <input type="radio" name="columns" checked={draft.columns === n} onChange={() => update({ columns: n })} />
                <span>{n} kolom</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend>Bentuk gambar sampul</legend>
          <div className="choices">
            {RATIOS.map((r) => (
              <label key={r.id} className={draft.cardRatio === r.id ? "choice is-on" : "choice"}>
                <input type="radio" name="ratio" checked={draft.cardRatio === r.id} onChange={() => update({ cardRatio: r.id })} />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
          <p className="hint">Bentuk seragam terlihat paling rapi. &quot;Ukuran asli&quot; menjaga setiap gambar tidak terpotong, tetapi susunannya tidak sejajar.</p>
        </fieldset>
      </section>

      <section className="form card">
        <h2>Bagian yang ditampilkan</h2>
        {[
          ["showFilter", "Filter kategori di atas galeri"],
          ["showClient", "Nama klien di bawah judul karya"],
          ["showAbout", "Bagian Tentang"],
          ["showContact", "Bagian Kontak"],
        ].map(([key, label]) => (
          <label className="check" key={key}>
            <input type="checkbox" checked={draft[key]} onChange={(e) => update({ [key]: e.target.checked })} />
            <span>{label}</span>
          </label>
        ))}
      </section>
    </div>
  );
}
