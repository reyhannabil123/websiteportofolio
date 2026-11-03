import { notFound } from "next/navigation";
import { adminPathOk, ipAllowed, isAdmin } from "@/lib/auth";
import { emptyDb, readDbFresh } from "@/lib/db";
import { localMode } from "@/lib/storage";
import AdminApp from "@/components/admin/AdminApp";
import AdminLogin from "@/components/admin/AdminLogin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// Satu-satunya pintu masuk admin. Alamat yang salah, atau IP yang tidak diizinkan,
// mendapat halaman 404 biasa, persis seperti alamat yang tidak pernah ada.
export default async function AdminPage({ params }) {
  const { adminPath } = await params;
  if (!adminPathOk(adminPath) || !(await ipAllowed())) notFound();

  if (!(await isAdmin())) return <AdminLogin adminPath={adminPath} />;

  let db;
  let problem = "";
  try {
    db = await readDbFresh();
  } catch (err) {
    db = emptyDb();
    problem = `Data belum bisa dibaca: ${err.message} Pastikan Blob store sudah terhubung ke project ini dan sudah di-redeploy.`;
  }

  return <AdminApp initial={db} problem={problem} localMode={localMode()} />;
}
