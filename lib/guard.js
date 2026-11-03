import { NextResponse } from "next/server";
import { isAdmin, ipAllowed } from "./auth";

// Respons kosong 404, sama seperti alamat yang memang tidak ada.
export function notFoundResponse() {
  return new NextResponse(null, { status: 404 });
}

// Semua API admin memanggil ini lebih dulu. Siapa pun yang belum login (atau IP-nya
// tidak diizinkan) hanya melihat 404, tanpa petunjuk bahwa API ini ada.
export async function adminOnly() {
  if (!(await ipAllowed()) || !(await isAdmin())) return notFoundResponse();
  return null;
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function fail(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
