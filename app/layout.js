import "@fontsource-variable/newsreader";
import "@fontsource-variable/instrument-sans";
import "./globals.css";
import { getDb } from "@/lib/db";

function siteUrl() {
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(prod ? `https://${prod}` : "http://localhost:3000");
}

export async function generateMetadata() {
  const { settings: s } = await getDb();
  const title = s.seoTitle || [s.name, s.role].filter(Boolean).join(" — ");
  const description = s.seoDescription || s.tagline;
  return {
    metadataBase: siteUrl(),
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }) {
  const { settings: s } = await getDb();
  return (
    <html
      lang="id"
      data-theme={s.theme}
      data-font={s.fontStyle}
      style={s.accent ? { "--accent": s.accent } : undefined}
    >
      <body>{children}</body>
    </html>
  );
}
