import Link from "next/link";
import { notFound } from "next/navigation";
import Carousel from "@/components/Carousel";
import ProjectInfo from "@/components/ProjectInfo";
import SiteHeader from "@/components/SiteHeader";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

async function findProject(slug) {
  const { settings, projects } = await getDb();
  const visible = projects.filter((p) => p.visible);
  const index = visible.findIndex((p) => p.slug === slug);
  return { settings, visible, index };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { settings, visible, index } = await findProject(slug);
  if (index === -1) return { title: "404" };
  const p = visible[index];
  const description = p.description.slice(0, 160) || [p.client, p.category].filter(Boolean).join(", ");
  return {
    title: `${p.title} — ${settings.name}`,
    description,
    openGraph: { title: p.title, description, images: [p.images[0].url] },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const { settings, visible, index } = await findProject(slug);
  if (index === -1) notFound();

  const project = visible[index];
  const prev = visible[index - 1];
  const next = visible[index + 1];

  return (
    <>
      <SiteHeader settings={settings} />

      <main className="project-page">
        <Link className="back-link" href="/#karya">
          Semua karya
        </Link>

        <div className="project-layout">
          <Carousel images={project.images} alt={project.title} captureKeys />
          <ProjectInfo project={project} as="h1" />
        </div>

        {(prev || next) && (
          <nav className="project-nav" aria-label="Karya lain">
            {prev ? (
              <Link href={`/karya/${prev.slug}`}>
                <span>Sebelumnya</span>
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/karya/${next.slug}`} className="project-nav-next">
                <span>Berikutnya</span>
                {next.title}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </main>

      <footer className="site-footer">
        <span>{settings.footerText || `© ${new Date().getFullYear()} ${settings.name}`}</span>
      </footer>
    </>
  );
}
