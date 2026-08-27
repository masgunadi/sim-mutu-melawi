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
2. Buka project di [script.google.com](https://script.google.com) (atau `clasp open`), pilih fungsi
   `setupConfigSpreadsheet`, isi argumennya dengan ID folder tadi (langsung di editor, pojok atas
   ada pilihan fungsi + tombol Run — atau jalankan lewat baris perintah di bagian bawah editor),
   lalu jalankan sekali. Kalau folder belum ada / mau simpel dulu, boleh dijalankan tanpa argumen —
   Spreadsheet Config akan dibuat di My Drive, bisa dipindah manual belakangan.
3. Ini membuat Spreadsheet Config pusat ("SIM Mutu Melawi - Config") berisi sheet `Sekolah` dan
   `Pengguna`, dan menyimpan ID-nya di Script Properties.
4. Tambahkan baris admin pertama secara manual di sheet `Pengguna` (lihat `docs/hak-akses.md`).
5. Pertama kali `DriveApp` dipakai (fitur folder ini), Apps Script akan minta otorisasi ulang untuk
   izin akses Drive — wajar, terima saja saat menjalankan fungsi di atas.

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
