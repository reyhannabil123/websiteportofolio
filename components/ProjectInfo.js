import ShareButton from "./ShareButton";

export default function ProjectInfo({ project, as: Heading = "h2" }) {
  const facts = [
    ["Klien", project.client],
    ["Kategori", project.category],
    ["Tahun", project.year],
  ].filter(([, value]) => value);
  const paragraphs = project.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="info">
      <Heading className="info-title">{project.title}</Heading>

      {facts.length > 0 && (
        <dl className="facts">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {paragraphs.length > 0 && (
        <div className="info-text">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      <div className="info-actions">
        <ShareButton slug={project.slug} />
      </div>
    </div>
  );
}
