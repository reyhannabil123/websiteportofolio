# Website portofolio desain (versi 2)

Portofolio dengan galeri publik yang tenang dan panel admin pribadi. Dari admin Anda bisa:

- mengunggah karya dengan **banyak gambar per karya** (misalnya 3 mockup untuk satu klien), yang di website digeser seperti carousel Instagram;
- mengubah **seluruh isi dan tampilan situs** (nama, kalimat utama, tentang, kontak, tema terang atau gelap, gaya huruf, jumlah kolom, dan lainnya) tanpa menyentuh kode;
- mengatur urutan karya, menyembunyikan karya sebagai draf, dan menghapusnya.

Teknologi: Next.js 15, Vercel Blob (penyimpanan gambar dan data), login dengan cookie bertanda tangan. Tidak perlu database.

---

## Admin yang hanya bisa dibuka oleh Anda

- Admin **tidak punya link di mana pun** di website. Alamatnya hanya Anda yang tahu: `https://situs-anda.com/<ADMIN_PATH>`.
- Alamat seperti `/admin` atau `/login`, dan alamat rahasia yang salah, tampil **404** persis seperti halaman yang tidak pernah ada. Semua API admin juga menjawab 404 untuk orang yang belum login.
- Di atas itu masih ada username dan password, batas percobaan login, dan sesi yang kedaluwarsa dalam 7 hari.
- Opsional: isi `ALLOWED_IPS` supaya admin hanya terbuka dari IP internet Anda. Hati-hati, kalau IP Anda berganti-ganti (misalnya internet ponsel), Anda bisa terkunci. Kalau terkunci, kosongkan variabel itu di Vercel lalu redeploy.

Catatan jujur: website tidak bisa benar-benar tampak "tidak ada internet" bagi orang luar, karena server harus membalas sesuatu. Balasan 404 adalah yang paling mendekati: tidak ada petunjuk bahwa admin pernah ada.

---

## Bagian 1. Coba di komputer sendiri (tanpa akun Vercel)

1. Pasang **Node.js** (versi LTS) dari https://nodejs.org.
2. Di folder project, jalankan `npm install`.
3. Salin pengaturan: `copy .env.example .env.local` (Windows) atau `cp .env.example .env.local` (Mac/Linux).
4. Buka `.env.local` dengan Notepad dan isi:
   ```
   ADMIN_PATH=masuk-k7x2q9m4
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=password-panjang-pilihan-anda
   AUTH_SECRET=hasil-perintah-di-bawah
   ```
   Buat `AUTH_SECRET` dengan: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   Ganti `ADMIN_PATH` dengan teks acak buatan Anda sendiri (8 sampai 64 huruf, angka, `-` atau `_`).
   Biarkan `BLOB_READ_WRITE_TOKEN` dan `ALLOWED_IPS` kosong.
5. Jalankan `npm run dev`, lalu buka http://localhost:3000.
6. Admin ada di `http://localhost:3000/<ADMIN_PATH>`, misalnya `http://localhost:3000/masuk-k7x2q9m4`.

Saat `BLOB_READ_WRITE_TOKEN` kosong, website otomatis memakai **mode lokal**: data disimpan di folder `.local-data` dan gambar di `public/uploads`. Jadi Anda bisa mencoba seluruh admin, termasuk upload banyak gambar, sebelum deploy. Mode ini tidak pernah aktif di Vercel. Data uji coba ini tidak ikut ke GitHub dan tidak otomatis pindah ke website online.

Perubahan di `.env.local` baru terbaca setelah `npm run dev` dihentikan (`Ctrl + C`) lalu dijalankan lagi.

---

## Bagian 2. Deploy ke Vercel

### Pertama kali

1. **GitHub.** Buat repository Private, lalu di folder project jalankan:
   ```
   git init
   git add .
   git status
   git commit -m "Portofolio v2"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
   Cek hasil `git status`: tidak boleh ada `.env.local`. File `.env.example` harus berisi isian kosong, tanpa password asli.
2. **Vercel.** Masuk ke https://vercel.com dengan GitHub, klik **Add New > Project**, pilih repository, **Import**.
3. Sebelum klik Deploy, isi **Environment Variables**:

   | Name | Value |
   | --- | --- |
   | `ADMIN_PATH` | alamat rahasia pilihan Anda |
   | `ADMIN_USERNAME` | username pilihan Anda |
   | `ADMIN_PASSWORD` | password kuat pilihan Anda |
   | `AUTH_SECRET` | teks acak 32 karakter ke atas (buat baru, jangan sama dengan yang di komputer) |

4. Klik **Deploy**.
5. **Blob store.** Tab **Storage > Create Database > Blob**, beri nama, pilih akses **Public**, lalu **Connect** ke project dan centang semua environment. Variabel `BLOB_READ_WRITE_TOKEN` terisi otomatis.
6. **Redeploy** supaya token terbaca: tab **Deployments**, titik tiga (⋯) pada deployment teratas, **Redeploy**.
7. Buka `https://alamat-anda.vercel.app/<ADMIN_PATH>` dan masuk.

### Memperbarui dari versi sebelumnya (yang punya /login dan /admin)

1. Ganti isi folder project dengan versi 2 ini (jaga folder `.git` agar riwayat tetap ada).
2. Di Vercel: **Settings > Environment Variables**, tambahkan **`ADMIN_PATH`** (variabel lain tetap dipakai).
3. Di terminal folder project:
   ```
   git add .
   git status
   git commit -m "Versi 2: admin tersembunyi, karya multi-gambar"
   git push
   ```
4. Vercel otomatis membangun dan menerbitkan versi baru. Alamat admin lama (`/login`) tidak berlaku lagi, pakai `/<ADMIN_PATH>`.
5. Karya yang sudah Anda unggah di versi pertama dimigrasi otomatis: setiap desain lama menjadi satu karya berisi satu gambar.

### Apa itu "redeploy"?

Redeploy dilakukan **di Vercel**, bukan di GitHub. Kalau repository sudah terhubung ke Vercel, setiap `git push` ke branch `main` otomatis menerbitkan versi baru, jadi Anda tidak perlu redeploy manual. Redeploy manual hanya perlu setelah mengubah Environment Variables atau menghubungkan Blob, karena perubahan itu baru terbaca pada deploy berikutnya.

---

## Memakai admin

- **Karya > Tambah karya.** Isi judul, klien, kategori, tahun, keterangan. Klik **Tambah gambar** dan pilih beberapa file sekaligus (tahan `Ctrl` atau `Shift`). Atur urutannya dengan tombol panah. Gambar pertama jadi sampul di galeri. Klik **Terbitkan karya**.
- Gambar diperkecil otomatis (sisi terpanjang maksimal 2400 px, format WebP) supaya website cepat dan kuota hemat. Matikan pilihannya kalau Anda ingin file persis seperti aslinya.
- **Karya.** Tombol ↑ ↓ mengatur urutan di galeri. **Ubah** untuk mengedit atau menambah gambar. Untuk draf, matikan "Tampilkan di website".
- **Teks dan kontak.** Nama, profesi, kalimat utama, tentang (plus foto), email, tautan media sosial, footer, dan judul untuk Google. Klik **Simpan perubahan** di bagian bawah layar.
- **Tampilan.** Tema terang atau gelap, warna aksen, tiga gaya huruf, jumlah kolom, bentuk gambar sampul, dan bagian yang ditampilkan.
- Setiap karya punya halaman sendiri (`/karya/nama-karya`) dan tombol **Salin tautan karya ini**, berguna untuk dikirim ke klien.

## Jika ada masalah

| Gejala | Penyebab dan solusi |
| --- | --- |
| Alamat admin tampil 404 | `ADMIN_PATH` belum diisi di Vercel atau salah ketik, atau belum redeploy. Atau `ALLOWED_IPS` terisi dan IP Anda tidak ada di daftar. |
| "ADMIN_PASSWORD atau AUTH_SECRET belum diisi" | Variabel belum ada di Vercel, atau `AUTH_SECRET` kurang dari 16 karakter. Isi lalu redeploy. |
| "Data belum bisa dibaca" di admin | Blob store belum terhubung atau belum redeploy. Ulangi langkah Blob store. |
| Upload gagal di file tertentu | Format harus JPG, PNG, WebP, GIF, atau AVIF, maksimal 25 MB per file (sebelum diperkecil). |
| "Terlalu banyak percobaan" saat login | Terlalu sering salah password. Tunggu sekitar 15 menit. |
| Perubahan belum tampil di website | Muat ulang halaman. Setelah disimpan di admin, website diperbarui otomatis. |
| Lupa password | Ubah `ADMIN_PASSWORD` di Vercel lalu redeploy. |
| Lupa alamat admin | Lihat nilai `ADMIN_PATH` di Vercel: **Settings > Environment Variables**. |

## Struktur folder

```
app/
  page.js                   Beranda publik
  karya/[slug]/page.js      Halaman satu karya
  [adminPath]/page.js       Pintu admin (hanya terbuka di alamat rahasia)
  api/admin/                API admin (semua 404 untuk non-admin)
components/                 Galeri, carousel, jendela karya
components/admin/           Panel admin
lib/                        Penyimpanan, keamanan, pengaturan
```
