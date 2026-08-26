import callApi from './client'

export function getRekapPresensi(idSekolah, tanggal) {
  return callApi('getRekapPresensi', { query: { idSekolah, tanggal } })
}

export function seedDummyPresensi(idSekolah) {
  return callApi('seedDummyPresensi', { method: 'POST', payload: { idSekolah } })
}
