"use client";

import { useEffect, useRef } from "react";
import Carousel from "./Carousel";
import ProjectInfo from "./ProjectInfo";

export default function ProjectViewer({ project, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button ref={closeRef} type="button" className="viewer-close" onClick={onClose}>
        Tutup
      </button>
      <div className="viewer-panel">
        <Carousel key={project.id} images={project.images} alt={project.title} captureKeys />
        <ProjectInfo project={project} />
      </div>
    </div>
  );
}
