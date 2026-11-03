import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { ipAllowed, isAdmin } from "@/lib/auth";
import { notFoundResponse, readBody } from "@/lib/guard";
import { localMode } from "@/lib/storage";

// Browser mengunggah gambar langsung ke Vercel Blob (tidak lewat server kita), jadi tidak
// terkena batas ukuran request 4,5 MB. Route ini hanya memberi "tiket upload" kepada admin.
export async function POST(request) {
  if (localMode()) return notFoundResponse();
  const body = await readBody(request);
  if (!body) return notFoundResponse();

  const allowed = (await ipAllowed()) && (await isAdmin());

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!allowed) throw new Error("denied");
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
          ],
          maximumSizeInBytes: 25 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (err) {
    if (!allowed) return notFoundResponse();
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
