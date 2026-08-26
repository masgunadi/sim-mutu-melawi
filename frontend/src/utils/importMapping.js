// Skema standar (belum disesuaikan dengan format asli export Dapodik).
// Alias di bawah dicocokkan case-insensitive terhadap header kolom file Excel.
const SISWA_ALIASES = {
  nisn: ['nisn'],
  nama: ['nama', 'nama siswa', 'nama peserta didik'],
  jenis_kelamin: ['jenis_kelamin', 'jenis kelamin', 'l/p', 'jk'],
  kelas: ['kelas', 'rombel', 'rombongan belajar'],
  tanggal_lahir: ['tanggal_lahir', 'tanggal lahir', 'tgl lahir'],
  status: ['status', 'status siswa'],
}

const GURU_ALIASES = {
  nip_nuptk: ['nip_nuptk', 'nip', 'nuptk'],
  nama: ['nama', 'nama guru', 'nama ptk'],
  jenis_kelamin: ['jenis_kelamin', 'jenis kelamin', 'l/p', 'jk'],
  status_kepegawaian: ['status_kepegawaian', 'status kepegawaian', 'jenis ptk'],
  mapel: ['mapel', 'mata pelajaran'],
  status: ['status', 'status aktif'],
}

function normalizeHeader(h) {
  return String(h || '').trim().toLowerCase()
}

function buildHeaderIndex(rawHeaders) {
  return rawHeaders.map(normalizeHeader)
}

function findColumn(normalizedHeaders, aliases) {
  return normalizedHeaders.findIndex((h) => aliases.includes(h))
}

function mapRows(rawRows, aliasMap) {
  if (!rawRows.length) return { rows: [], unmatchedFields: Object.keys(aliasMap) }

  const headers = buildHeaderIndex(Object.keys(rawRows[0]))
  const originalKeys = Object.keys(rawRows[0])
  const fieldToColumnKey = {}
  const unmatchedFields = []

  Object.entries(aliasMap).forEach(([field, aliases]) => {
    const idx = findColumn(headers, aliases)
    if (idx === -1) {
      unmatchedFields.push(field)
    } else {
      fieldToColumnKey[field] = originalKeys[idx]
    }
  })

  const rows = rawRows.map((raw) => {
    const mapped = {}
    Object.entries(fieldToColumnKey).forEach(([field, columnKey]) => {
      mapped[field] = raw[columnKey] != null ? String(raw[columnKey]).trim() : ''
    })
    return mapped
  })

  return { rows, unmatchedFields }
}

export function mapSiswaRows(rawRows) {
  return mapRows(rawRows, SISWA_ALIASES)
}

export function mapGuruRows(rawRows) {
  return mapRows(rawRows, GURU_ALIASES)
}
