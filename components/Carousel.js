"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function Chevron({ flip }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

// Geser ke samping seperti postingan carousel di Instagram: swipe di ponsel,
// tombol panah dan tombol keyboard di komputer, titik penanda di bawah.
export default function Carousel({ images, alt, captureKeys = false }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const first = images[0];
  const stage = Math.min(1.5, Math.max(0.75, first.width / first.height));

  const goTo = useCallback(
    (i) => {
      const el = trackRef.current;
      if (!el) return;
      const target = Math.max(0, Math.min(count - 1, i));
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({ left: target * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
    },
    [count]
  );

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    if (!captureKeys || count < 2) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [captureKeys, count, index, goTo]);

  return (
    <div className="carousel" style={{ "--stage": stage }} role="group" aria-roledescription="carousel" aria-label={alt}>
      <ul className="carousel-track" ref={trackRef} onScroll={onScroll}>
        {images.map((img, i) => (
          <li className="carousel-slide" key={img.url} aria-label={`Gambar ${i + 1} dari ${count}`}>
            <img
              src={img.url}
              alt={count > 1 ? `${alt}, gambar ${i + 1} dari ${count}` : alt}
              width={img.width}
              height={img.height}
              loading={i < 2 ? "eager" : "lazy"}
              decoding="async"
              draggable="false"
            />
          </li>
        ))}
      </ul>

      {count > 1 && (
        <>
          <button type="button" className="carousel-btn carousel-prev" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Gambar sebelumnya">
            <Chevron flip />
          </button>
          <button type="button" className="carousel-btn carousel-next" onClick={() => goTo(index + 1)} disabled={index === count - 1} aria-label="Gambar berikutnya">
            <Chevron />
          </button>
          <div className="carousel-dots">
            {images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                className={i === index ? "dot is-active" : "dot"}
                aria-label={`Ke gambar ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
