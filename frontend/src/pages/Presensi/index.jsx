import { useEffect, useState } from 'react'
import { listSekolah } from '../../api/sekolah'
import { getRekapPresensi, seedDummyPresensi } from '../../api/presensi'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function Presensi() {
  const [sekolahList, setSekolahList] = useState([])
  const [idSekolah, setIdSekolah] = useState('')
  const [tanggal, setTanggal] = useState(todayStr())
  const [rekap, setRekap] = useState(null)
  const [status, setStatus] = useState('loading-sekolah')
  const [errorMessage, setErrorMessage] = useState('')
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    listSekolah()
      .then((res) => {
        if (!res.ok) throw new Error(res.error)
        setSekolahList(res.data)
        if (res.data.length > 0) setIdSekolah(res.data[0].id_sekolah)
        setStatus(res.data.length > 0 ? 'idle' : 'no-sekolah')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }, [])

  function loadRekap() {
    if (!idSekolah) return
    setStatus('loading-rekap')
    setErrorMessage('')
    getRekapPresensi(idSekolah, tanggal)
      .then((res) => {
        if (!res.ok) throw new Error(res.error)
        setRekap(res)
        setStatus('idle')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }

  useEffect(() => {
    if (idSekolah) loadRekap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSekolah, tanggal])

  function handleSeed() {
    setSeeding(true)
    setErrorMessage('')
    seedDummyPresensi(idSekolah)
      .then((res) => {
        if (!res.ok) throw new Error(res.error)
        loadRekap()
      })
      .catch((err) => setErrorMessage(err.message))
      .finally(() => setSeeding(false))
  }

  return (
    <div>
      <div className="page-header">
        <h1>Presensi</h1>
      </div>

      {status === 'loading-sekolah' && <p>Memuat daftar sekolah...</p>}

      {status === 'no-sekolah' && (
        <p>Belum ada sekolah terdaftar. Tambahkan sekolah dulu di menu Data Sekolah.</p>
      )}

      {status === 'error' && sekolahList.length === 0 && (
        <p className="error-text">
          Gagal memuat data: {errorMessage}
          {!import.meta.env.VITE_API_BASE_URL && ' (VITE_API_BASE_URL belum diatur)'}
        </p>
      )}

      {sekolahList.length > 0 && (
        <>
          <div className="filter-bar">
            <label>
              Sekolah
              <select value={idSekolah} onChange={(e) => setIdSekolah(e.target.value)}>
                {sekolahList.map((s) => (
                  <option key={s.id_sekolah} value={s.id_sekolah}>
                    {s.nama_sekolah}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tanggal
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </label>

            <button className="btn" onClick={handleSeed} disabled={seeding}>
              {seeding ? 'Membuat data dummy...' : 'Generate Data Dummy'}
            </button>
          </div>

          {errorMessage && <p className="error-text">{errorMessage}</p>}

          {status === 'loading-rekap' && <p>Memuat rekap...</p>}

          {rekap && status !== 'loading-rekap' && (
            <>
              <div className="summary-cards">
                <SummaryCard label="Hadir" value={rekap.summary.Hadir} tone="ok" />
                <SummaryCard label="Sakit" value={rekap.summary.Sakit} tone="warn" />
                <SummaryCard label="Izin" value={rekap.summary.Izin} tone="warn" />
                <SummaryCard label="Alpa" value={rekap.summary.Alpa} tone="bad" />
              </div>

              {rekap.rows.length === 0 ? (
                <p>
                  Belum ada data presensi untuk tanggal ini. Klik &quot;Generate Data Dummy&quot; untuk
                  mencoba tampilan dengan data contoh (7 hari terakhir).
                </p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>NISN</th>
                      <th>Nama</th>
                      <th>Kelas</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekap.rows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.nisn}</td>
                        <td>{r.nama}</td>
                        <td>{r.kelas}</td>
                        <td>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className={`summary-card summary-card--${tone}`}>
      <div className="summary-card__value">{value}</div>
      <div className="summary-card__label">{label}</div>
    </div>
  )
}
