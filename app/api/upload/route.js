import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { isAdmin } from "@/lib/auth";

// Browser mengunggah gambar langsung ke Vercel Blob (tanpa lewat server kita),
// jadi tidak terkena batas ukuran request 4,5 MB milik Vercel.
// Route ini hanya memberi "tiket upload", dan hanya untuk admin yang sudah login.
export async function POST(request) {
  const body = await request.json();

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await isAdmin())) {
          throw new Error("Tidak diizinkan. Silakan login ulang.");
        }
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
          ],
          maximumSizeInBytes: 25 * 1024 * 1024, // 25 MB per file
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
