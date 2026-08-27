# Backend (Google Apps Script)

API JSON untuk SIM Mutu Melawi, dipanggil oleh frontend React (`../frontend`).

## Setup lokal dengan clasp

```bash
npm install -g @google/clasp
clasp login
```

Buat Apps Script project baru (sekali saja), lalu hubungkan folder ini:

```bash
clasp create --type webapp --title "SIM Mutu Melawi API" --rootDir .
```

Atau kalau project Apps Script sudah ada, salin `.clasp.json.example` menjadi `.clasp.json`
dan isi `scriptId` sesuai project-nya (`.clasp.json` di-gitignore karena isinya spesifik per akun).

## Deploy

```bash
clasp push
clasp deploy --description "deskripsi singkat perubahan"
```

Setelah deploy, salin URL Web App ke `frontend/.env` sebagai `VITE_API_BASE_URL`.

## Setup data (sekali saja)

1. Kalau sudah bikin folder "00-Config" di Drive Bersama (lihat panduan folder), buka folder itu
   di [drive.google.com](https://drive.google.com) dan salin ID-nya dari URL
   (`drive.google.com/drive/folders/<ID-nya-di-sini>`).
2. Buka project di [script.google.com](https://script.google.com) (atau `clasp open`). Di sidebar
   kiri klik ikon ⚙️ **Project Settings**, scroll ke bagian **Script Properties**, klik
   **Add script property**, isi Property = `CONFIG_FOLDER_ID` dan Value = ID folder tadi, lalu
   **Save**. (Boleh dilewati kalau folder belum siap — Spreadsheet Config akan dibuat di My Drive
   dan bisa dipindah manual belakangan.)
3. Kembali ke tab **Editor** (ikon `<>` di sidebar kiri), di dropdown fungsi (pojok atas, sebelah
   tombol Run/Debug) pilih `setupConfigSpreadsheet`, lalu klik **Run**. Tidak perlu isi apapun lagi
   — fungsi ini otomatis membaca `CONFIG_FOLDER_ID` dari Script Properties.
4. Ini membuat Spreadsheet Config pusat ("SIM Mutu Melawi - Config") berisi sheet `Sekolah` dan
   `Pengguna`, dan menyimpan ID-nya di Script Properties.
5. Tambahkan baris admin pertama secara manual di sheet `Pengguna` (lihat `docs/hak-akses.md`).
6. Pertama kali `DriveApp` dipakai (fitur folder ini), Apps Script akan minta otorisasi ulang untuk
   izin akses Drive saat klik Run — klik **Review permissions**, pilih akun belajar.id-mu, kalau
   muncul peringatan "Google hasn't verified this app" klik **Advanced** → **Go to [nama project]
   (unsafe)**. Ini normal untuk aplikasi buatan sendiri.

Setiap sekolah baru yang ditambahkan lewat menu Data Sekolah otomatis dapat Spreadsheet data
sendiri (sheet `Siswa`, `Guru`, `Presensi`), terdaftar di Config ini — dan kalau diisi Folder ID
di form Tambah Sekolah, Spreadsheet-nya langsung dibuat di folder sekolah itu di Drive Bersama.

## Struktur

- `Code.gs` — entry point (`doGet`/`doPost`) dan router aksi (`routeAction_`)
- `Auth.gs` — login & hak akses (verifikasi token Google, sheet `Pengguna`, penyaring akses)
- `Sekolah.gs` — modul Data Sekolah: Spreadsheet Config pusat + Spreadsheet data per sekolah
- `Presensi.gs` — modul Presensi
- `appsscript.json` — manifest project (timezone, izin web app)

Setiap modul baru cukup menambah `case` di `routeAction_` dan fungsi handler-nya sendiri.
