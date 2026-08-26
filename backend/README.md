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

Buka project di [script.google.com](https://script.google.com) (atau `clasp open`), pilih fungsi
`setupConfigSpreadsheet`, lalu jalankan sekali (Run). Ini membuat Spreadsheet Config pusat
("SIM Mutu Melawi - Config") berisi daftar sekolah, dan menyimpan ID-nya di Script Properties.
Setiap sekolah baru yang ditambahkan lewat menu Data Sekolah otomatis dapat Spreadsheet data
sendiri (sheet `Siswa` & `Guru`), terdaftar di Config ini.

## Struktur

- `Code.gs` — entry point (`doGet`/`doPost`) dan router aksi (`routeAction_`)
- `Sekolah.gs` — modul Data Sekolah: Spreadsheet Config pusat + Spreadsheet data per sekolah
- `appsscript.json` — manifest project (timezone, izin web app)

Setiap modul baru cukup menambah `case` di `routeAction_` dan fungsi handler-nya sendiri.
