import Link from "next/link";

export default function SiteHeader({ settings }) {
  return (
    <header className="site-header">
      <Link className="site-name" href="/">
        {settings.name}
      </Link>
      <nav aria-label="Navigasi utama">
        <Link href="/#karya">Karya</Link>
        {settings.showAbout && <Link href="/#tentang">Tentang</Link>}
        {settings.showContact && <Link href="/#kontak">Kontak</Link>}
      </nav>
    </header>
  );
}
