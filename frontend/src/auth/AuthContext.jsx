import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { setAuthToken } from './tokenStore'
import { getCurrentUser } from '../api/auth'

const STORAGE_KEY = 'sim-mutu-id-token'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading') // loading | signed-out | signed-in
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const loadUser = useCallback((token) => {
    setAuthToken(token)
    setStatus('loading')
    getCurrentUser()
      .then((res) => {
        if (!res.ok) throw new Error(res.error)
        setUser({ email: res.email, nama: res.nama, roles: res.roles })
        setStatus('signed-in')
        sessionStorage.setItem(STORAGE_KEY, token)
      })
      .catch((err) => {
        setAuthToken(null)
        sessionStorage.removeItem(STORAGE_KEY)
        setUser(null)
        setErrorMessage(err.message)
        setStatus('signed-out')
      })
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      loadUser(saved)
    } else {
      setStatus('signed-out')
    }
  }, [loadUser])

  function signOut() {
    setAuthToken(null)
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
    setStatus('signed-out')
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect()
    }
  }

  return (
    <AuthContext.Provider value={{ status, user, errorMessage, signIn: loadUser, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
