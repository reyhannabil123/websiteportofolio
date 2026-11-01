"use client";

import { useState } from "react";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal masuk. Coba lagi.");
        setBusy(false);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi internet Anda.");
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Username
        <input name="username" type="text" autoComplete="username" required defaultValue="" />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
