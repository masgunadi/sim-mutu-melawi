import { useEffect, useState } from 'react'
import { listSekolah } from '../../api/sekolah'
import { useAuth } from '../../auth/AuthContext'
import { hasRole } from '../../auth/roles'
import TambahSekolahForm from './TambahSekolahForm'
import SekolahDetail from './SekolahDetail'

export default function DataSekolah() {
  const { user } = useAuth()
  const bolehTambah = hasRole(user, 'admin_dinas')
  const [sekolahList, setSekolahList] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  function reload() {
    setStatus('loading')
    listSekolah()
      .then((res) => {
        if (!res.ok) throw new Error(res.error)
        setSekolahList(res.data)
        setStatus('ready')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }

  useEffect(reload, [])

  if (selectedId) {
    return (
      <SekolahDetail
        idSekolah={selectedId}
        onBack={() => {
          setSelectedId(null)
          reload()
        }}
      />
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Data Sekolah</h1>
        {bolehTambah && (
          <button className="btn btn--primary" onClick={() => setShowForm(true)}>
            + Tambah Sekolah
          </button>
        )}
      </div>

      {showForm && (
        <TambahSekolahForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            reload()
          }}
        />
      )}

      {status === 'loading' && <p>Memuat data sekolah...</p>}

      {status === 'error' && (
        <p className="error-text">
          Gagal memuat data: {errorMessage}
          {!import.meta.env.VITE_API_BASE_URL && ' (VITE_API_BASE_URL belum diatur)'}
        </p>
      )}

      {status === 'ready' && sekolahList.length === 0 && (
        <p>Belum ada sekolah terdaftar. Klik &quot;Tambah Sekolah&quot; untuk mulai.</p>
      )}

      {status === 'ready' && sekolahList.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Sekolah</th>
              <th>NPSN</th>
              <th>Kecamatan</th>
              <th>Desa</th>
              <th>Skema Input</th>
              <th>Jumlah Siswa</th>
              <th>Jumlah Guru</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sekolahList.map((s) => (
              <tr key={s.id_sekolah}>
                <td>{s.nama_sekolah}</td>
                <td>{s.npsn}</td>
                <td>{s.kecamatan}</td>
                <td>{s.desa}</td>
                <td>{s.skema_input}</td>
                <td>{s.jumlah_siswa}</td>
                <td>{s.jumlah_guru}</td>
                <td>
                  <button className="btn btn--link" onClick={() => setSelectedId(s.id_sekolah)}>
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
