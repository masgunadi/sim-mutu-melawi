import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Diisi lewat env VITE_BASE_PATH saat build di GitHub Actions (lihat
  // .github/workflows/deploy-pages.yml) karena GitHub Pages project page
  // disajikan di bawah /nama-repo/. Kalau nanti pindah ke domain sendiri
  // (mis. mutu.melawikab.go.id, di root), env ini tidak perlu diisi lagi.
  base: process.env.VITE_BASE_PATH || '/',
})
