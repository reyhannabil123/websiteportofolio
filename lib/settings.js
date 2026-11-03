import { cleanText, isStoredUrl } from "./util";

// Nilai awal. Semuanya bisa diubah dari panel admin, tanpa menyentuh kode.
export const DEFAULT_SETTINGS = {
  name: "Nama Anda",
  role: "Desainer grafis dan visual",
  tagline: "Identitas merek, poster, dan antarmuka yang dirancang dengan teliti.",
  about:
    "Saya mengerjakan identitas merek dan materi visual dari ide awal sampai file siap pakai. Setiap proyek dimulai dengan memahami siapa yang akan melihatnya dan apa yang perlu mereka ingat.\n\nSaya menerima proyek logo, kemasan, poster, dan tampilan aplikasi. Ceritakan kebutuhan Anda lewat email, saya balas dalam dua hari kerja.",
  aboutImage: "",
  email: "halo@contoh.com",
  links: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Behance", href: "https://behance.net/" },
  ],
  contactHeading: "Mari bicara",
  footerText: "",
  seoTitle: "",
  seoDescription: "",

  theme: "light", // light | dark
  fontStyle: "elegan", // elegan | modern | klasik
  accent: "", // kosong = ikut warna teks
  columns: 3, // 2 | 3 | 4
  cardRatio: "4:5", // 4:5 | 1:1 | 3:2 | asli
  showFilter: true,
  showClient: true,
  showAbout: true,
  showContact: true,
};

export const FONT_STYLES = ["elegan", "modern", "klasik"];
export const THEMES = ["light", "dark"];
export const RATIOS = ["4:5", "1:1", "3:2", "asli"];
export const COLUMNS = [2, 3, 4];

const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);
const bool = (value, fallback) => (typeof value === "boolean" ? value : fallback);

function cleanLinks(value, fallback) {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((l) => ({
      label: cleanText(l?.label, 40),
      href: cleanText(l?.href, 300),
    }))
    .filter((l) => l.label && /^(https?:\/\/|mailto:)/i.test(l.href))
    .slice(0, 8);
}

// Membersihkan data dari form admin: batasi panjang, buang nilai yang tidak dikenal.
export function sanitizeSettings(input, base = DEFAULT_SETTINGS) {
  const s = input && typeof input === "object" ? input : {};
  const b = { ...DEFAULT_SETTINGS, ...base };
  const text = (key, max) => (key in s ? cleanText(s[key], max) : b[key]);

  const email = text("email", 120);
  const accent = "accent" in s ? String(s.accent || "").trim() : b.accent;
  const aboutImage = "aboutImage" in s ? String(s.aboutImage || "") : b.aboutImage;
  const columns = Number(s.columns ?? b.columns);

  return {
    name: text("name", 60) || b.name,
    role: text("role", 90),
    tagline: text("tagline", 240),
    about: "about" in s ? String(s.about ?? "").trim().slice(0, 3000) : b.about,
    aboutImage: aboutImage === "" || isStoredUrl(aboutImage) ? aboutImage : b.aboutImage,
    email: email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : b.email,
    links: "links" in s ? cleanLinks(s.links, b.links) : b.links,
    contactHeading: text("contactHeading", 60),
    footerText: text("footerText", 120),
    seoTitle: text("seoTitle", 90),
    seoDescription: text("seoDescription", 200),

    theme: pick(s.theme, THEMES, b.theme),
    fontStyle: pick(s.fontStyle, FONT_STYLES, b.fontStyle),
    accent: accent === "" || /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : b.accent,
    columns: COLUMNS.includes(columns) ? columns : b.columns,
    cardRatio: pick(s.cardRatio, RATIOS, b.cardRatio),
    showFilter: bool(s.showFilter, b.showFilter),
    showClient: bool(s.showClient, b.showClient),
    showAbout: bool(s.showAbout, b.showAbout),
    showContact: bool(s.showContact, b.showContact),
  };
}
