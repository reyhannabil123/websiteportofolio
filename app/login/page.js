import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Masuk admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="auth">
      <a className="auth-back" href="/">
        Kembali ke website
      </a>
      <h1>Masuk admin</h1>
      <LoginForm />
    </main>
  );
}
