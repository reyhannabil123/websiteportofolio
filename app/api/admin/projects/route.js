import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { adminOnly, fail, readBody } from "@/lib/guard";
import { updateDb } from "@/lib/db";
import { sanitizeProjectInput, uniqueSlug } from "@/lib/projects";

export async function POST(request) {
  const blocked = await adminOnly();
  if (blocked) return blocked;

  const input = sanitizeProjectInput(await readBody(request));
  if (input.error) return fail(input.error);

  try {
    const project = await updateDb((db) => {
      const now = new Date().toISOString();
      const p = {
        id: crypto.randomUUID(),
        slug: uniqueSlug(input.value.title, db.projects),
        ...input.value,
        createdAt: now,
        updatedAt: now,
      };
      db.projects.unshift(p);
      return p;
    });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return fail(`Gagal menyimpan: ${err.message}`, 500);
  }
}
