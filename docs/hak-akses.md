# Login & Hak Akses

## Cara kerja

1. Pengguna login pakai akun Google (Sign In with Google) di SPA.
2. Frontend dapat `idToken` dari Google, dan menyertakannya di **setiap** panggilan API.
3. Backend (`backend/Auth.gs`) verifikasi token itu langsung ke Google (`tokeninfo` endpoint),
   ambil emailnya, lalu cari baris-baris yang cocok di sheet **Pengguna** (Spreadsheet Config).
4. Tiap action menyaring data sesuai cakupan peran orang itu — lihat `hasAccessToSekolah_` dan
   `canEditSekolah_` di `backend/Auth.gs`.

Satu email bisa punya lebih dari satu baris di sheet Pengguna (Pengawas dengan beberapa sekolah
binaan = beberapa baris; Orang Tua dengan beberapa anak = beberapa baris nanti).

## Setup wajib sebelum bisa dipakai

1. Buat **OAuth 2.0 Client ID** di [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (tipe "Web application", tambahkan alamat GitHub Pages/domain sebagai *Authorized JavaScript origin*).
2. Isi Client ID itu di dua tempat:
   - `backend/Auth.gs` → konstanta `GOOGLE_OAUTH_CLIENT_ID`
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID`
3. Tambahkan baris admin pertama secara manual di sheet **Pengguna** (Spreadsheet Config), supaya
   ada minimal 1 akun `admin_dinas` yang bisa login dan menambah pengguna lain lewat aplikasi nanti.

## Skema sheet Pengguna

| email | nama | peran | cakupan_tipe | cakupan_nilai | status_aktif |
|---|---|---|---|---|---|
| kadis@belajar.id | Kepala Dinas | admin_dinas | kabupaten | (kosong) | TRUE |
| pengawas1@belajar.id | Budi | pengawas | sekolah | SKL-aaa | TRUE |
| pengawas1@belajar.id | Budi | pengawas | sekolah | SKL-bbb | TRUE |
| kepsek1@belajar.id | Siti | kepala_sekolah | sekolah | SKL-aaa | TRUE |
| camat1@... | Andi | camat | kecamatan | Kec. Nanga Pinoh | TRUE |
| kepdes1@... | Rina | kepala_desa | desa | Desa Sido Mulyo | TRUE |

`cakupan_tipe` menentukan cara pencocokan: `kabupaten` (semua), `kecamatan`/`desa` (cocok kolom
`kecamatan`/`desa` di sheet Sekolah), `sekolah` (cocok `id_sekolah`).

## Status implementasi per peran

Fondasi (login, tabel peran, penyaringan data) berlaku untuk **semua** peran. Tapi fitur spesifik
tiap peran baru diisi sejalan dengan modul datanya masing-masing:

| Peran | Fondasi (login + lihat data sesuai cakupan) | Fitur khusus — status |
|---|---|---|
| Admin Dinas | ✅ | Lihat rinci semua modul — ✅ (memakai modul yang sudah ada) |
| Pengawas | ✅ (lihat sekolah binaan) | Beri komentar, indeks merah/kuning/hijau — ⏳ menyusul (butuh modul Indeks Mutu) |
| Kepala Sekolah/Operator | ✅ (akses penuh sekolahnya) | Peringatan siklus & kinerja guru — ⏳ menyusul (butuh modul SPMI & Kinerja) |
| Wakil Kepala Sekolah | ✅ (lihat sekolahnya) | Edit dokumen per bidang — ⏳ menyusul (butuh modul Dokumen) |
| Guru | ✅ (lihat sekolahnya) | Edit sesuai bidang/kelas — ⏳ menyusul |
| Siswa | ⏳ (butuh cakupan individu + modul Nilai/Prestasi) | — |
| Orang Tua | ⏳ (butuh modul Nilai/Prestasi + login non-belajar.id) | — |
| Komite Sekolah | ✅ (lihat sekolah) | Transparansi keuangan, saran — ⏳ menyusul (butuh modul Keuangan) |
| Kepala Desa | ✅ (lihat agregat sekolah di desanya) | Perbandingan & status bantuan — ⏳ menyusul (butuh modul Agregat Wilayah) |
| Camat | ✅ (lihat agregat sekolah di kecamatannya) | Sama seperti Kepala Desa — ⏳ menyusul |
| Masyarakat Umum | ✅ (halaman publik, tanpa login) | — |

Jangan kaget kalau beberapa peran di atas belum kelihatan bedanya di tampilan sekarang — datanya
memang belum ada modulnya. Yang sudah pasti bekerja sekarang: siapa boleh lihat sekolah mana.
