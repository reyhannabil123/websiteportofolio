export const metadata = { title: "404", robots: { index: false } };

// Dipakai untuk semua alamat yang tidak ada, termasuk alamat admin yang salah.
export default function NotFound() {
  return (
    <main className="notfound">
      <h1>404</h1>
      <p>Halaman ini tidak ditemukan.</p>
      <a href="/">Ke beranda</a>
    </main>
  );
}
