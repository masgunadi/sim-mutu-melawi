import { useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function LoginScreen() {
  const { signIn, errorMessage } = useAuth()
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false

    function trySetup() {
      if (cancelled) return
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => signIn(response.credential),
        })
        window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large' })
      } else {
        setTimeout(trySetup, 200)
      }
    }
    trySetup()

    return () => {
      cancelled = true
    }
  }, [signIn])

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>SIM Mutu Melawi</h1>
        <p className="text-muted">
          Sistem Penjaminan Mutu &amp; Informasi Manajemen Sekolah — Kabupaten Melawi.
        </p>

        {!CLIENT_ID && (
          <p className="warning-text">
            VITE_GOOGLE_CLIENT_ID belum diatur — lihat docs/hak-akses.md untuk cara setup.
          </p>
        )}
        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <div ref={buttonRef} className="login-button" />

        <p className="text-muted login-note">
          Masyarakat umum tidak perlu masuk untuk melihat ringkasan publik di sini. Login hanya
          diperlukan untuk mengakses data sekolah sesuai peran (dinas, pengawas, sekolah, dst).
        </p>
      </div>
    </div>
  )
}
