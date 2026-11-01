import Gallery from "@/components/Gallery";
import { getDesigns } from "@/lib/store";
import { site } from "@/lib/site";

// Selalu ambil data terbaru supaya desain yang baru diunggah langsung tampil.
export const dynamic = "force-dynamic";

export default async function Home() {
  const designs = await getDesigns();

  return (
    <>
      <header className="masthead">
        <a className="masthead-name" href="#top">
          {site.name}
        </a>
        <nav aria-label="Navigasi utama">
          <a href="#karya">Karya</a>
          <a href="#tentang">Tentang</a>
          <a href="#kontak">Kontak</a>
        </nav>
      </header>

      <main id="top">
        <section className="intro">
          <h1>
            {site.name}
            <span className="intro-role">{site.role}</span>
          </h1>
          <p className="intro-tagline">{site.tagline}</p>
        </section>

        <section id="karya" className="work" aria-label="Karya">
          <Gallery designs={designs} />
        </section>

        <section id="tentang" className="about">
          <h2>Tentang</h2>
          <div className="about-body">
            {site.about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <section id="kontak" className="contact">
          <h2>Mari bicara</h2>
          <a className="contact-mail" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <ul className="contact-links">
            {site.links
              .filter((l) => l.href)
              .map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
          </ul>
        </section>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <a href="/login">Admin</a>
      </footer>
    </>
  );
}
