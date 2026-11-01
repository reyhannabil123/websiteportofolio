import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getDesigns } from "@/lib/store";
import { site } from "@/lib/site";
import AdminPanel from "@/components/AdminPanel";

export const metadata = { title: "Kelola karya", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/login");

  const designs = await getDesigns();
  const tokenMissing = !process.env.BLOB_READ_WRITE_TOKEN;

  return (
    <main className="admin">
      <AdminPanel
        initialDesigns={designs}
        suggestions={site.categorySuggestions}
        tokenMissing={tokenMissing}
      />
    </main>
  );
}
