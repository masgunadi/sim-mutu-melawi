import { useAuth } from '../auth/AuthContext'
import { roleLabels } from '../auth/roles'

export default function Topbar() {
  const { user, signOut } = useAuth()

  return (
    <header className="topbar">
      <div className="topbar__title">Sistem Penjaminan Mutu &amp; Informasi Manajemen Sekolah</div>
      <div className="topbar__user">
        {user && (
          <>
            <span>{user.nama} &middot; {roleLabels(user) || 'Tanpa peran'}</span>
            <button className="btn btn--link" onClick={signOut}>
              Keluar
            </button>
          </>
        )}
      </div>
    </header>
  )
}
