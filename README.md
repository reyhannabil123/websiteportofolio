# Website portofolio desain

Website portofolio dengan galeri publik dan halaman admin tempat Anda login lalu mengunggah, mengubah, dan menghapus desain kapan saja, tanpa menyentuh kode.

**Teknologi:** Next.js 15, Vercel Blob (penyimpanan gambar dan daftar karya), login dengan cookie bertanda tangan (JWT). Tidak perlu database.

## Isi website

| Halaman | Alamat | Keterangan |
| --- | --- | --- |
| Beranda | `/` | Nama, galeri karya dengan filter kategori, tampilan besar saat gambar diklik, tentang, kontak |
| Login | `/login` | Username dan password admin |
| Admin | `/admin` | Unggah banyak gambar sekaligus, ubah judul dan kategori, hapus karya |

---

## Bagian 1. Jalankan di komputer sendiri (opsional tapi disarankan)

1. Pasang **Node.js** versi LTS dari https://nodejs.org lalu cek dengan `node -v` di terminal.
2. Buka folder project ini di terminal, lalu jalankan:
   ```bash
   npm install
   ```
3. Salin file contoh pengaturan:
   ```bash
   cp .env.example .env.local
   ```
   Di Windows (Command Prompt): `copy .env.example .env.local`
4. Buka `.env.local` dan isi:
   - `ADMIN_USERNAME` dan `ADMIN_PASSWORD`: login pilihan Anda. Pakai password yang panjang dan tidak dipakai di tempat lain.
   - `AUTH_SECRET`: jalankan perintah ini lalu tempel hasilnya:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
5. Jalankan:
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000. Halaman admin ada di http://localhost:3000/login.

Upload gambar baru bisa dicoba setelah **Bagian 3** (Blob store) selesai, karena penyimpanan gambar ada di Vercel. Tanpa itu, website tetap tampil dan login tetap bisa dipakai, hanya upload yang belum jalan.

---

## Bagian 2. Ubah nama dan teks Anda

Buka `lib/site.js`. Ganti nama, profesi, kalimat pembuka, teks "Tentang", email, dan link media sosial. Judul bagian lain (Karya, Tentang, Mari bicara) ada di `app/page.js`.

Warna ada di bagian paling atas `app/globals.css` (`--accent` adalah warna biru utama).

---

## Bagian 3. Deploy ke Vercel (langkah demi langkah)

### Langkah 1. Taruh kode di GitHub

1. Buat akun di https://github.com kalau belum punya.
2. Klik **New repository**, beri nama misalnya `portofolio`, biarkan **Private** (dianjurkan), lalu **Create repository**. Jangan centang pilihan README atau .gitignore.
3. Pasang **Git** dari https://git-scm.com kalau belum ada.
4. Di folder project, jalankan satu per satu (ganti `USERNAME` dengan username GitHub Anda):
   ```bash
   git init
   git add .
   git commit -m "Portofolio pertama"
   git branch -M main
   git remote add origin https://github.com/USERNAME/portofolio.git
   git push -u origin main
   ```
   File `.env.local` otomatis **tidak ikut** terunggah (sudah diatur di `.gitignore`). Itu benar, password tidak boleh masuk GitHub.

### Langkah 2. Impor project ke Vercel

1. Daftar atau masuk di https://vercel.com dengan **Continue with GitHub**.
2. Klik **Add New… > Project**.
3. Pilih repository `portofolio` lalu klik **Import**. Kalau repository tidak muncul, klik **Adjust GitHub App Permissions** lalu beri akses.
4. Vercel mengenali Next.js otomatis, jadi jangan ubah pengaturan build.
5. **Buka dulu bagian "Environment Variables"** di halaman yang sama dan tambahkan tiga ini:

   | Name | Value |
   | --- | --- |
   | `ADMIN_USERNAME` | username pilihan Anda |
   | `ADMIN_PASSWORD` | password kuat pilihan Anda |
   | `AUTH_SECRET` | teks acak 32 karakter ke atas (cara membuatnya ada di Bagian 1, langkah 4) |

6. Klik **Deploy** dan tunggu sekitar satu menit. Website Anda sudah online di alamat seperti `https://portofolio-xxxx.vercel.app`.

### Langkah 3. Aktifkan penyimpanan gambar (Vercel Blob)

Website sudah tampil, tapi upload gambar baru jalan setelah langkah ini.

1. Di dashboard Vercel, buka project Anda lalu tab **Storage**.
2. Klik **Create Database** (atau **Create**), pilih **Blob**, lalu **Continue**.
3. Beri nama misalnya `portofolio-blob`. Pada **Access**, pilih **Public**, karena gambar portofolio memang harus bisa dilihat pengunjung. Pilih region terdekat (misalnya Singapore), lalu **Create**.
4. Saat diminta menghubungkan ke project, pilih project `portofolio` dan centang semua environment (Production, Preview, Development), lalu **Connect**. Vercel menambahkan variabel `BLOB_READ_WRITE_TOKEN` otomatis.
5. **Deploy ulang** supaya variabel baru terbaca: tab **Deployments**, klik titik tiga (⋯) pada deployment paling atas, lalu **Redeploy**.

### Langkah 4. Coba

1. Buka `https://alamat-anda.vercel.app/login`.
2. Masuk dengan username dan password dari Langkah 2.
3. Pilih satu atau beberapa gambar, isi kategori, lalu klik **Unggah**. Gambar langsung tampil di beranda.

Mulai sekarang Anda tidak perlu menyentuh Vercel atau GitHub untuk menambah karya. Cukup login di `/login`.

---

## Mengubah teks atau tampilan setelah online

Edit file di komputer Anda lalu:

```bash
git add .
git commit -m "Ubah teks tentang"
git push
```

Vercel otomatis membangun dan menerbitkan versi baru dalam satu menit. Karya yang sudah Anda unggah tidak terhapus, karena tersimpan di Blob, bukan di kode.

## Pakai domain sendiri (misalnya namaanda.com)

1. Beli domain di penyedia mana pun (Niagahoster, Namecheap, Cloudflare, dll.).
2. Di Vercel: project > **Settings > Domains** > ketik domain Anda > **Add**.
3. Vercel menampilkan record DNS yang harus dipasang. Salin ke panel DNS di tempat Anda membeli domain.
4. Tunggu beberapa menit sampai beberapa jam. Setelah itu ubah `url` di `lib/site.js` ke domain baru.

---

## Jika ada masalah

| Gejala | Penyebab dan solusi |
| --- | --- |
| Di admin muncul "BLOB_READ_WRITE_TOKEN belum terisi" | Blob store belum terhubung ke project, atau belum redeploy. Ulangi Langkah 3 poin 4 dan 5. |
| Login menampilkan "ADMIN_PASSWORD dan AUTH_SECRET belum diisi" | Variabel belum ada di Vercel. Tambahkan di **Settings > Environment Variables**, lalu redeploy. |
| Setelah login langsung dikembalikan ke halaman login | `AUTH_SECRET` kurang dari 16 karakter, atau berubah setelah login. Isi ulang dengan teks acak yang panjang, redeploy, lalu login lagi. |
| Upload gagal dengan "Tidak diizinkan" | Sesi login habis (berlaku 7 hari). Keluar lalu masuk lagi. |
| Upload gagal di file tertentu | Format harus JPG, PNG, WebP, GIF, atau AVIF, dan maksimal 25 MB per file. File PSD, AI, atau PDF perlu diekspor jadi gambar dulu. |
| Gambar baru belum tampil | Muat ulang halaman. Daftar karya selalu diambil terbaru saat halaman dibuka. |
| Lupa password admin | Ubah `ADMIN_PASSWORD` di **Settings > Environment Variables**, lalu redeploy. |

## Catatan keamanan

- Password admin hanya ada di environment variables Vercel, tidak di kode atau GitHub.
- Cookie login bersifat `httpOnly` (tidak bisa dibaca JavaScript), `secure` di produksi, dan kedaluwarsa dalam 7 hari.
- Semua aksi tulis (unggah, ubah, hapus) dicek ulang di server, jadi tidak bisa ditembus hanya dengan membuka alamat `/admin`.
- Kuota gratis Vercel Blob dan Vercel Hobby cukup untuk portofolio pribadi. Cek batas terbarunya di https://vercel.com/pricing. Paket Hobby ditujukan untuk penggunaan non-komersial. Kalau portofolio ini dipakai untuk mencari klien berbayar, baca syarat penggunaannya.
- Kompres gambar sebelum diunggah (misalnya ke WebP, lebar 2000 px) supaya halaman cepat dibuka di ponsel pengunjung.

## Struktur folder

```
app/
  page.js              Beranda publik
  login/page.js        Halaman login
  admin/page.js        Halaman admin (dijaga login)
  api/                 login, logout, upload, daftar desain
components/            Galeri, form login, panel admin
lib/
  site.js              Teks dan link Anda (edit di sini)
  auth.js              Login dan sesi
  store.js             Baca dan simpan daftar karya di Blob
```
