import ProjectGrid from "@/components/ProjectGrid";
import SiteHeader from "@/components/SiteHeader";
import { getDb } from "@/lib/db";

// Selalu tampilkan data terbaru. Pembacaan datanya sendiri di-cache dan dibuat ulang
// otomatis begitu admin menyimpan sesuatu.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { settings: s, projects } = await getDb();
  const visible = projects.filter((p) => p.visible);
  const paragraphs = s.about.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const links = s.links.filter((l) => l.href);

  return (
    <>
      <SiteHeader settings={s} />

      <main>
        <section className="intro">
          {s.role && <p className="intro-role">{s.role}</p>}
          <h1 className="intro-tagline">{s.tagline || s.name}</h1>
        </section>

        <section id="karya" className="work" aria-label="Karya">
          <ProjectGrid
            projects={visible}
            settings={{
              columns: s.columns,
              cardRatio: s.cardRatio,
              showFilter: s.showFilter,
              showClient: s.showClient,
            }}
          />
        </section>

        {s.showAbout && paragraphs.length > 0 && (
          <section id="tentang" className="about">
            <div className="about-side">
              <h2>Tentang</h2>
              {s.aboutImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="about-photo" src={s.aboutImage} alt={`Foto ${s.name}`} loading="lazy" />
              )}
            </div>
            <div className="about-body">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        {s.showContact && (s.email || links.length > 0) && (
          <section id="kontak" className="contact">
            <h2>{s.contactHeading || "Kontak"}</h2>
            <div className="contact-body">
              {s.email && (
                <a className="contact-mail" href={`mailto:${s.email}`}>
                  {s.email}
                </a>
              )}
              {links.length > 0 && (
                <ul className="contact-links">
                  {links.map((l) => (
                    <li key={l.label + l.href}>
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <span>{s.footerText || `© ${new Date().getFullYear()} ${s.name}`}</span>
      </footer>
    </>
  );
}
