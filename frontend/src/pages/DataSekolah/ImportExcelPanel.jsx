import { useState } from 'react'
import * as XLSX from 'xlsx'
import { mapGuruRows, mapSiswaRows } from '../../utils/importMapping'
import { importSiswaGuru } from '../../api/sekolah'

export default function ImportExcelPanel({ idSekolah, onImported }) {
  const [tipe, setTipe] = useState('siswa')
  const [preview, setPreview] = useState(null)
  const [unmatchedFields, setUnmatchedFields] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setStatus('parsing')
    setErrorMessage('')

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })
        const { rows, unmatchedFields } = tipe === 'siswa' ? mapSiswaRows(rawRows) : mapGuruRows(rawRows)
        setPreview(rows)
        setUnmatchedFields(unmatchedFields)
        setStatus('previewing')
      } catch (err) {
        setErrorMessage('Gagal membaca file: ' + err.message)
        setStatus('idle')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleImport() {
    setStatus('importing')
    const payload = { idSekolah, siswa: tipe === 'siswa' ? preview : [], guru: tipe === 'guru' ? preview : [] }
    importSiswaGuru(payload)
      .then((res) => {
        if (!res.ok) throw new Error(res.error)
        setPreview(null)
        setStatus('idle')
        onImported(res)
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('previewing')
      })
  }

  return (
    <div className="import-panel">
      <h3>Import dari Excel</h3>

      <label>
        Jenis data
        <select value={tipe} onChange={(e) => { setTipe(e.target.value); setPreview(null) }}>
          <option value="siswa">Siswa</option>
          <option value="guru">Guru</option>
        </select>
      </label>

      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} />

      {status === 'parsing' && <p>Membaca file...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {unmatchedFields.length > 0 && (
        <p className="warning-text">
          Kolom tidak ditemukan (dikosongkan): {unmatchedFields.join(', ')} — cek nama header di file Excel.
        </p>
      )}

      {preview && (
        <>
          <p>{preview.length} baris siap diimport (preview 5 baris pertama):</p>
          <table className="data-table data-table--small">
            <thead>
              <tr>
                {Object.keys(preview[0] || {}).map((k) => (
                  <th key={k}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 5).map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((v, j) => (
                    <td key={j}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn--primary" onClick={handleImport} disabled={status === 'importing'}>
            {status === 'importing' ? 'Mengimpor...' : `Import ${preview.length} baris`}
          </button>
        </>
      )}
    </div>
  )
}
