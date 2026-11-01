"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function Gallery({ designs }) {
  const [active, setActive] = useState("Semua");
  const [openIndex, setOpenIndex] = useState(null);
  const closeRef = useRef(null);
  const lastFocused = useRef(null);

  const categories = useMemo(() => {
    const set = new Set(designs.map((d) => d.category).filter(Boolean));
    return ["Semua", ...Array.from(set)];
  }, [designs]);

  const visible = useMemo(
    () => (active === "Semua" ? designs : designs.filter((d) => d.category === active)),
    [designs, active]
  );

  const close = useCallback(() => {
    setOpenIndex(null);
    lastFocused.current?.focus?.();
  }, []);

  const step = useCallback(
    (dir) => {
      setOpenIndex((i) => (i === null ? i : (i + dir + visible.length) % visible.length));
    },
    [visible.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, step]);

  if (designs.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">Belum ada karya yang ditampilkan.</p>
        <p>
          Masuk lewat halaman <a href="/login">admin</a> untuk mengunggah desain pertama Anda.
        </p>
      </div>
    );
  }

  const current = openIndex !== null ? visible[openIndex] : null;

  return (
    <>
      {categories.length > 2 && (
        <div className="filters" role="group" aria-label="Filter kategori">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={c === active ? "chip is-active" : "chip"}
              aria-pressed={c === active}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <ul className="grid">
        {visible.map((d, i) => (
          <li key={d.id} className="tile">
            <button
              type="button"
              className="tile-button"
              onClick={(e) => {
                lastFocused.current = e.currentTarget;
                setOpenIndex(i);
              }}
              aria-label={`Buka ${d.title}`}
            >
              <img
                src={d.url}
                alt={d.title}
                width={d.width}
                height={d.height}
                loading="lazy"
                decoding="async"
                style={{ aspectRatio: `${d.width} / ${d.height}` }}
              />
              <span className="tile-caption">
                <span className="tile-title">{d.title}</span>
                <span className="tile-category">{d.category}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <button ref={closeRef} type="button" className="lb-close" onClick={close}>
            Tutup
          </button>

          {visible.length > 1 && (
            <>
              <button type="button" className="lb-nav lb-prev" onClick={() => step(-1)} aria-label="Sebelumnya">
                ‹
              </button>
              <button type="button" className="lb-nav lb-next" onClick={() => step(1)} aria-label="Berikutnya">
                ›
              </button>
            </>
          )}

          <figure className="lb-figure">
            <img src={current.url} alt={current.title} />
            <figcaption>
              <strong>{current.title}</strong>
              <span>{current.category}</span>
              {current.description && <p>{current.description}</p>}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
