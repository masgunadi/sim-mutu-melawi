import callApi from './client'

export function listSekolah() {
  return callApi('listSekolah')
}

export function getSekolahDetail(idSekolah) {
  return callApi('getSekolahDetail', { query: { idSekolah } })
}

export function addSekolah({ namaSekolah, npsn, kecamatan, skemaInput }) {
  return callApi('addSekolah', {
    method: 'POST',
    payload: { namaSekolah, npsn, kecamatan, skemaInput },
  })
}

export function importSiswaGuru({ idSekolah, siswa, guru }) {
  return callApi('importSiswaGuru', {
    method: 'POST',
    payload: { idSekolah, siswa, guru },
  })
}
