"use client";

import { useState } from "react";

export default function ShareButton({ slug }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/karya/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Salin tautan ini:", url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" className="text-button" onClick={copy}>
      {copied ? "Tautan disalin" : "Salin tautan karya ini"}
    </button>
  );
}
