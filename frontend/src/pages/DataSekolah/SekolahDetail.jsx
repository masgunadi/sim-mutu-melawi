import { useEffect, useState } from 'react'
import { getSekolahDetail } from '../../api/sekolah'
import ImportExcelPanel from './ImportExcelPanel'

export default function SekolahDetail({ idSekolah, onBack }) {
  const [detail, setDetail] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  function reload() {
    setStatus('loading')
    getSekolahDetail(idSekolah)
      .then((res) => {
        if (!res.ok) throw new Error(res.error)
        setDetail(res)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }

  useEffect(reload, [idSekolah])

  return (
    <div>
      <button className="btn btn--link" onClick={onBack}>
        &larr; Kembali ke daftar sekolah
      </button>

      {status === 'loading' && <p>Memuat detail sekolah...</p>}
      {status === 'error' && <p className="error-text">Gagal memuat: {errorMessage}</p>}

      {status === 'ready' && (
        <>
          <h1>{detail.sekolah.nama_sekolah}</h1>
          <p className="text-muted">
            NPSN {detail.sekolah.npsn} &middot; {detail.sekolah.kecamatan} &middot; Skema input:{' '}
            {detail.sekolah.skema_input}
          </p>

          <ImportExcelPanel idSekolah={idSekolah} onImported={reload} />

          <h2>Siswa ({detail.siswa.length})</h2>
          <SimpleTable rows={detail.siswa} />

          <h2>Guru ({detail.guru.length})</h2>
          <SimpleTable rows={detail.guru} />
        </>
      )}
    </div>
  )
}

function SimpleTable({ rows }) {
  if (rows.length === 0) return <p>Belum ada data.</p>
  const columns = Object.keys(rows[0])
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={c}>{row[c]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
