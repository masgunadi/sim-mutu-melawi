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

## Struktur

- `Code.gs` — entry point (`doGet`/`doPost`) dan router aksi (`routeAction_`)
- `appsscript.json` — manifest project (timezone, izin web app)

Setiap modul baru cukup menambah `case` di `routeAction_` dan fungsi handler-nya sendiri —
belum ada modul yang diimplementasikan di tahap shell ini.
