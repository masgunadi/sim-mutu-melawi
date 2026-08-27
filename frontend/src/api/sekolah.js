import callApi from './client'

export function listSekolah() {
  return callApi('listSekolah')
}

export function getSekolahDetail(idSekolah) {
  return callApi('getSekolahDetail', { query: { idSekolah } })
}

export function addSekolah({ namaSekolah, npsn, kecamatan, desa, skemaInput, folderId }) {
  return callApi('addSekolah', {
    method: 'POST',
    payload: { namaSekolah, npsn, kecamatan, desa, skemaInput, folderId },
  })
}

export function importSiswaGuru({ idSekolah, siswa, guru }) {
  return callApi('importSiswaGuru', {
    method: 'POST',
    payload: { idSekolah, siswa, guru },
  })
}
