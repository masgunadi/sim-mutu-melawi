import { HashRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import DataSekolah from './pages/DataSekolah'
import Presensi from './pages/Presensi'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="data-sekolah" element={<DataSekolah />} />
          <Route path="presensi" element={<Presensi />} />
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
    </HashRouter>
  )
}
