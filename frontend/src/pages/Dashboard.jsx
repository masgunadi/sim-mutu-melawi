import { useEffect, useState } from 'react'
import { ping } from '../api/client'

export default function Dashboard() {
  const [apiStatus, setApiStatus] = useState('belum dicek')

  useEffect(() => {
    if (!import.meta.env.VITE_API_BASE_URL) {
      setApiStatus('VITE_API_BASE_URL belum diatur')
      return
    }
    ping()
      .then((res) => setApiStatus(res.ok ? 'terhubung' : 'error: ' + res.error))
      .catch((err) => setApiStatus('gagal: ' + err.message))
  }, [])

  return (
    <div className="placeholder">
      <h1>Dashboard</h1>
      <p>Ringkasan KPI mutu (indikator Rapor Pendidikan, 8 SNP) akan tampil di sini.</p>
      <p className="api-status">Status koneksi backend: <strong>{apiStatus}</strong></p>
    </div>
  )
}
