import { NextResponse } from "next/server";
import {
  adminPathOk,
  checkCredentials,
  clearFailures,
  createSession,
  getClientIp,
  ipAllowed,
  isLocked,
  registerFailure,
} from "@/lib/auth";
import { fail, notFoundResponse, readBody } from "@/lib/guard";
import { sleep } from "@/lib/util";

export async function POST(request) {
  // Tanpa alamat rahasia yang benar, API ini berpura-pura tidak ada.
  if (!(await ipAllowed())) return notFoundResponse();
  const body = await readBody(request);
  if (!body || !adminPathOk(body.path)) return notFoundResponse();

  if (!process.env.ADMIN_PASSWORD || (process.env.AUTH_SECRET || "").length < 16) {
    return fail("ADMIN_PASSWORD atau AUTH_SECRET belum diisi (AUTH_SECRET minimal 16 karakter).", 500);
  }

  const ip = await getClientIp();
  if (isLocked(ip)) return fail("Terlalu banyak percobaan. Coba lagi sekitar 15 menit lagi.", 429);

  if (!checkCredentials(body.username, body.password)) {
    registerFailure(ip);
    await sleep(800);
    return fail("Username atau password salah.", 401);
  }

  clearFailures(ip);
  await createSession();
  return NextResponse.json({ ok: true });
}
