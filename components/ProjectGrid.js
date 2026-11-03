"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import ProjectViewer from "./ProjectViewer";

const RATIO_CSS = { "4:5": "4 / 5", "1:1": "1 / 1", "3:2": "3 / 2" };

function StackIcon() {
  return (
    <svg className="tile-stack" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="3" width="13" height="13" rx="2" />
      <path d="M16 20H6a2 2 0 0 1-2-2V8" strokeLinecap="round" />
    </svg>
  );
}

export default function ProjectGrid({ projects, settings }) {
  const [active, setActive] = useState("Semua");
  const [openId, setOpenId] = useState(null);
  const lastFocus = useRef(null);

  const categories = useMemo(
    () => Array.from(new Set(projects.map((p) => p.category).filter(Boolean))),
    [projects]
  );
  const shown = active === "Semua" ? projects : projects.filter((p) => p.category === active);
  const current = openId ? projects.find((p) => p.id === openId) : null;

  const close = useCallback(() => {
    setOpenId(null);
    lastFocus.current?.focus?.();
  }, []);

  if (projects.length === 0) {
    return (
      <div className="empty">
        <p>Karya sedang disiapkan. Silakan kembali lagi nanti.</p>
      </div>
    );
  }

  const natural = settings.cardRatio === "asli";
  const ratio = RATIO_CSS[settings.cardRatio];

  return (
    <>
      {settings.showFilter && categories.length > 1 && (
        <div className="filters" role="group" aria-label="Filter kategori">
          {["Semua", ...categories].map((c) => (
            <button
              key={c}
              type="button"
              className={c === active ? "filter is-active" : "filter"}
              aria-pressed={c === active}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <ul
        className={natural ? "grid grid--natural" : "grid grid--uniform"}
        style={{ "--cols": settings.columns, "--ratio": ratio }}
      >
        {shown.map((p) => {
          const cover = p.images[0];
          const sub = settings.showClient && p.client ? p.client : p.category;
          return (
            <li key={p.id} className="tile">
              <a
                className="tile-link"
                href={`/karya/${p.slug}`}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  lastFocus.current = e.currentTarget;
                  setOpenId(p.id);
                }}
              >
                <span
                  className="tile-media"
                  style={natural ? { aspectRatio: `${cover.width} / ${cover.height}` } : undefined}
                >
                  <img src={cover.url} alt="" width={cover.width} height={cover.height} loading="lazy" decoding="async" />
                  {p.images.length > 1 && <StackIcon />}
                </span>
                <span className="tile-caption">
                  <span className="tile-title">{p.title}</span>
                  {sub && <span className="tile-sub">{sub}</span>}
                </span>
                {p.images.length > 1 && <span className="sr-only">{p.images.length} gambar</span>}
              </a>
            </li>
          );
        })}
      </ul>

      {current && <ProjectViewer project={current} onClose={close} />}
    </>
  );
}
