import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import crypto from "node:crypto";

export const COOKIE_NAME = "admin_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 hari

function getSecret() {
  const secret = process.env.AUTH_SECRET || "";
  if (secret.length < 16) {
    throw new Error("AUTH_SECRET belum diisi atau terlalu pendek (minimal 16 karakter).");
  }
  return new TextEncoder().encode(secret);
}

// Membandingkan lewat hash supaya panjang input tidak bocor lewat waktu respons.
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// ---------- Alamat rahasia admin ----------

// Admin hanya ada di alamat /<ADMIN_PATH>. Selain itu semuanya 404, seolah halaman tidak ada.
// Jika ADMIN_PATH belum diisi dengan benar, admin otomatis mati (aman secara bawaan).
export function adminPathOk(candidate) {
  const expected = process.env.ADMIN_PATH || "";
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(expected)) return false;
  return safeEqual(candidate ?? "", expected);
}

// ---------- Pembatasan IP (opsional) ----------

export async function getClientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "";
}

// Jika ALLOWED_IPS diisi, hanya IP di daftar itu yang bisa menyentuh admin sama sekali.
export async function ipAllowed() {
  const allowed = (process.env.ALLOWED_IPS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.length === 0) return true;
  return allowed.includes(await getClientIp());
}

// ---------- Batas percobaan login (per instance server, bersifat tambahan) ----------

const failures = new Map(); // ip -> { count, first }
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 6;

export function isLocked(ip) {
  const f = failures.get(ip);
  if (!f) return false;
  if (Date.now() - f.first > WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return f.count >= MAX_FAILURES;
}

export function registerFailure(ip) {
  const f = failures.get(ip);
  if (!f || Date.now() - f.first > WINDOW_MS) failures.set(ip, { count: 1, first: Date.now() });
  else f.count += 1;
}

export function clearFailures(ip) {
  failures.delete(ip);
}

// ---------- Kredensial dan sesi ----------

export function checkCredentials(username, password) {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || "";
  if (!expectedPass || !username || !password) return false;
  const userOk = safeEqual(username, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  return userOk && passOk;
}

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function isAdmin() {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
