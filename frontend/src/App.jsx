import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import DataSekolah from './pages/DataSekolah'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="data-sekolah" element={<DataSekolah />} />
          <Route
            path="presensi"
            element={<PlaceholderPage title="Presensi" description="Rekap presensi harian per sekolah (offline import, web, atau AppSheet)." />}
          />
          <Route
            path="mutu"
            element={<PlaceholderPage title="Penjaminan Mutu" description="Siklus SPMI: EDS, rencana pemenuhan mutu, monitoring, tindak lanjut." />}
          />
          <Route
            path="akreditasi"
            element={<PlaceholderPage title="Akreditasi" description="Dokumen bukti 8 SNP dan status akreditasi per sekolah." />}
          />
          <Route
            path="import-export"
            element={<PlaceholderPage title="Import / Export" description="Import Excel Dapodik/Rapor Pendidikan, export laporan PDF/Excel." />}
          />
          <Route
            path="*"
            element={<PlaceholderPage title="Halaman tidak ditemukan" description="Cek kembali menu di sidebar." />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
