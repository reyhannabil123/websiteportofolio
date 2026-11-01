import { NextResponse } from "next/server";
import { checkCredentials, createSession } from "@/lib/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD dan AUTH_SECRET belum diisi di environment variables." },
      { status: 500 }
    );
  }

  if (!checkCredentials(body?.username, body?.password)) {
    // Jeda singkat memperlambat tebak-tebakan password.
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
