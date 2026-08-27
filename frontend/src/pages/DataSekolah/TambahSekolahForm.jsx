import { useState } from 'react'
import { addSekolah } from '../../api/sekolah'

export default function TambahSekolahForm({ onClose, onCreated }) {
  const [namaSekolah, setNamaSekolah] = useState('')
  const [npsn, setNpsn] = useState('')
  const [kecamatan, setKecamatan] = useState('')
  const [desa, setDesa] = useState('')
  const [skemaInput, setSkemaInput] = useState('offline')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage('')
    addSekolah({ namaSekolah, npsn, kecamatan, desa, skemaInput })
      .then((res) => {
        if (!res.ok) throw new Error(res.error)
        onCreated()
      })
      .catch((err) => setErrorMessage(err.message))
      .finally(() => setSubmitting(false))
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <h2>Tambah Sekolah</h2>

        <label>
          Nama Sekolah
          <input value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)} required />
        </label>

        <label>
          NPSN
          <input value={npsn} onChange={(e) => setNpsn(e.target.value)} required />
        </label>

        <label>
          Kecamatan
          <input value={kecamatan} onChange={(e) => setKecamatan(e.target.value)} required />
        </label>

        <label>
          Desa
          <input value={desa} onChange={(e) => setDesa(e.target.value)} required />
        </label>

        <label>
          Skema Input
          <select value={skemaInput} onChange={(e) => setSkemaInput(e.target.value)}>
            <option value="offline">Offline (import berkala)</option>
            <option value="web">Web langsung</option>
            <option value="appsheet">AppSheet</option>
          </select>
        </label>

        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <div className="modal__actions">
          <button type="button" className="btn" onClick={onClose} disabled={submitting}>
            Batal
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
