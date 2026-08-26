# Arsitektur SIM Mutu Melawi

## Skala
- 113 SMP, ±10.000 siswa, ±1.200 guru
- Uji coba tahap awal: 10–15 sekolah sampel
- Akun Google: belajar.id (Google Workspace for Education) untuk semua guru & siswa

## Stack (Opsi B)
- **Frontend**: React + Vite (SPA), di-deploy ke GitHub Pages
- **Backend**: Google Apps Script Web App — JSON API murni (bukan HtmlService), lihat `backend/`
- **Database**: Google Sheets
- **Input lapangan (rencana)**: AppSheet, offline-first, sinkron saat online

## Model data multi-sekolah

Karena presensi harian per sekolah cukup besar (113 sekolah × ±10.000 siswa),
setiap sekolah punya **spreadsheet presensi sendiri**, bukan satu spreadsheet raksasa gabungan.
Alasan:
- Menghindari batas ukuran/performa satu spreadsheet
- Isolasi akses — operator sekolah hanya perlu akses ke spreadsheet sekolahnya sendiri
- Sekolah bisa mulai pakai sistem secara independen (cocok untuk rollout bertahap 10–15 sekolah dulu)

Struktur:
- **Spreadsheet Config (pusat)** — 1 sheet berisi daftar sekolah: `id_sekolah`, `nama_sekolah`,
  `spreadsheet_id_presensi`, status aktif, skema input yang dipakai (offline/web/AppSheet), dll.
- **Spreadsheet per sekolah** — sheet `Presensi`, `Siswa`, `Guru` mengikuti template standar yang sama
  di semua sekolah (supaya bisa diproses generik oleh backend).
- **Spreadsheet Agregat (pusat)** — hasil ringkasan yang ditarik berkala dari tiap spreadsheet sekolah
  (via time-driven trigger di Apps Script, mis. tiap malam), supaya dashboard tidak perlu query puluhan
  spreadsheet secara langsung tiap kali dibuka.

Ini masih desain — implementasi trigger agregasi & template sheet per sekolah menyusul di modul berikutnya,
belum ada di tahap shell ini.

## Tiga skema input data

1. **Offline → import berkala** — untuk sekolah dengan sinyal minim. Operator isi file Excel offline,
   lalu diimpor ke sistem secara mingguan/bulanan saat ada koneksi (lewat upload di web atau kirim file).
2. **Input langsung via web** — untuk sekolah dengan sinyal lancar, input real-time lewat SPA yang
   memanggil backend GAS.
3. **AppSheet (offline-first)** — untuk input lapangan (mis. presensi harian, checklist audit mutu),
   AppSheet menyimpan data lokal saat offline dan sinkron otomatis ke spreadsheet saat online.

Ketiga skema ini bermuara ke spreadsheet yang sama sebagai sumber data, sehingga modul dashboard tidak
perlu tahu skema mana yang dipakai sekolah tertentu.

## Sumber data eksternal
- **Dapodik**: tidak ada API publik per sekolah — alurnya export manual (Excel/ODS) oleh operator sekolah,
  diimpor berkala (per semester).
- **Portal Rapor Pendidikan Kemendikdasmen**: unduh PDF/Excel resmi per sekolah dari portal, diimpor berkala.

## Alur permintaan
```
SPA (GitHub Pages) --fetch/JSON--> GAS Web App (routeAction_) --> Google Sheets (Config / per-sekolah / Agregat)
```

## Status implementasi
Tahap saat ini: **shell kosong** — layout, navigasi, dan skeleton API sudah ada;
modul data (dashboard KPI, import, presensi, dst.) belum diimplementasikan.
