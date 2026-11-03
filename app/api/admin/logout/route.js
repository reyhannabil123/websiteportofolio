import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { adminOnly } from "@/lib/guard";

export async function POST() {
  const blocked = await adminOnly();
  if (blocked) return blocked;
  await destroySession();
  return NextResponse.json({ ok: true });
}
