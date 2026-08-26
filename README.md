# SIM Mutu Melawi

Sistem Penjaminan Mutu & Informasi Manajemen Sekolah untuk SMP di Kabupaten Melawi.

- `frontend/` — SPA React + Vite (dashboard)
- `backend/` — Google Apps Script Web App (JSON API), lihat [backend/README.md](backend/README.md)
- `docs/arsitektur.md` — keputusan arsitektur & desain data

## Status

Tahap awal: **shell dashboard kosong** — layout, navigasi, dan koneksi backend skeleton.
Modul data (import Dapodik, presensi, SPMI, akreditasi, dll.) menyusul secara bertahap.

## Menjalankan frontend secara lokal

```bash
cd frontend
npm install
cp .env.example .env   # isi VITE_API_BASE_URL setelah backend di-deploy
npm run dev
```
