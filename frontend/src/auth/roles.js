export const ROLE_LABELS = {
  admin_dinas: 'Admin Dinas',
  pengawas: 'Pengawas',
  kepala_sekolah: 'Kepala Sekolah',
  wakil_kepala_sekolah: 'Wakil Kepala Sekolah',
  guru: 'Guru',
  siswa: 'Siswa',
  orang_tua: 'Orang Tua',
  komite: 'Komite Sekolah',
  kepala_desa: 'Kepala Desa',
  camat: 'Camat',
}

export function hasRole(user, role) {
  return !!user?.roles?.some((r) => r.peran === role)
}

export function hasAnyRole(user, roles) {
  return !!user?.roles?.some((r) => roles.includes(r.peran))
}

export function roleLabels(user) {
  const unique = [...new Set((user?.roles || []).map((r) => r.peran))]
  return unique.map((r) => ROLE_LABELS[r] || r).join(', ')
}
