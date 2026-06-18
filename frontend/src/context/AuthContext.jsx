import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

const TOKEN_KEY           = 'bmr_token'
const USER_KEY            = 'bmr_user'
const SESSION_EXPIRES_KEY = 'bmr_session_expires_at'
const SESSION_TIMEOUT_MS  = 30 * 60 * 1000

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

function normalizeRole(rawRole) {
  if (!rawRole) return 'USER'
  const role = String(rawRole).trim().toUpperCase()
  if (role === 'ROLE_ADMIN' || role === 'ADMIN') return 'ADMIN'
  if (role === 'ROLE_USER' || role === 'PASSENGER' || role === 'CUSTOMER') return 'USER'
  return role.replace(/^ROLE_/, '')
}

function isAdminRole(role) {
  return normalizeRole(role) === 'ADMIN'
}

function buildUser(data, fallback = {}) {
  const source = data?.user ?? data?.account ?? data?.profile ?? data ?? {}
  const role =
    source?.role ?? source?.userRole ?? source?.authority ??
    source?.authorities?.[0]?.authority ?? source?.authorities?.[0] ??
    data?.role ?? data?.userRole ?? data?.authority ??
    data?.authorities?.[0]?.authority ?? data?.authorities?.[0] ??
    fallback.role

  return {
    id:    source?.userId ?? source?.id ?? data?.userId ?? data?.id ?? fallback.id,
    name:  source?.name ?? data?.name ?? fallback.name ?? source?.email ?? data?.email ?? fallback.email ?? 'User',
    email: source?.email ?? data?.email ?? fallback.email,
    phone: source?.phone ?? data?.phone ?? fallback.phone ?? '',
    role:  normalizeRole(role),
  }
}

function unwrapResponse(resData) {
  return resData?.data ?? resData?.result ?? resData
}

function findToken(data) {
  if (typeof data === 'string') return data
  return (
    data?.accessToken ?? data?.token ?? data?.jwt ?? data?.bearerToken ??
    data?.auth?.accessToken ?? data?.auth?.token ??
    data?.user?.accessToken ?? data?.user?.token
  )
}

function readSavedUser() {
  try {
    const saved = localStorage.getItem(USER_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function setSessionExpiry() {
  localStorage.setItem(SESSION_EXPIRES_KEY, String(Date.now() + SESSION_TIMEOUT_MS))
}

function clearSessionStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(SESSION_EXPIRES_KEY)
}

function isSessionExpired() {
  const expiresAt = Number(localStorage.getItem(SESSION_EXPIRES_KEY) || 0)
  return Boolean(expiresAt && Date.now() > expiresAt)
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY)
      const saved = readSavedUser()

      if (token && saved) {
        if (isSessionExpired()) {
          clearSessionStorage()
          setUser(null)
          setLoading(false)
          return
        }
        try {
          const normalized = buildUser(saved)
          setUser(normalized)
          setSessionExpiry()
          localStorage.setItem(USER_KEY, JSON.stringify(normalized))

          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          const fresh = res.data?.data
          if (fresh) {
            const updated = buildUser(fresh, normalized)
            setUser(updated)
            localStorage.setItem(USER_KEY, JSON.stringify(updated))
          }
        } catch {
          clearSessionStorage()
          setUser(null)
        }
      }
      setLoading(false)
    }
    restoreSession()
  }, [])

  const loginWithEndpoint = async (endpoint, email, password) => {
    const res = await api.post(endpoint, { email, password })
    const data = unwrapResponse(res.data)
    if (!data) throw new Error('Invalid response from server')
    const token = findToken(data)
    if (!token) throw new Error('Login response did not include an access token')
    const userObj = buildUser(data, { email })
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userObj))
    setSessionExpiry()
    setUser(userObj)
    toast.success(`Welcome back, ${userObj.name}!`)
    return userObj
  }

  const login = (email, password) =>
    loginWithEndpoint('/auth/login', email, password)



  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    const data = unwrapResponse(res.data)
    if (!data) throw new Error('Invalid response from server')
    const token = findToken(data)
    if (!token) throw new Error('Register response did not include an access token')
    const userObj = buildUser(data, { name: payload.name, email: payload.email })
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userObj))
    setSessionExpiry()
    setUser(userObj)
    toast.success("Account created! Let's roll")
    return userObj
  }

  const googleLogin = async (googleIdToken) => {
    const res = await api.post('/auth/oauth/google', { idToken: googleIdToken })
    const data = unwrapResponse(res.data)
    if (!data) throw new Error('Invalid response from server')
    const token = findToken(data)
    if (!token) throw new Error('Google login did not return an access token')
    const userObj = buildUser(data)
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userObj))
    setSessionExpiry()
    setUser(userObj)
    toast.success(`Welcome, ${userObj.name}!`)
    return userObj
  }

  const logout = ({ expired = false } = {}) => {
    clearSessionStorage()
    setUser(null)
    toast[expired ? 'error' : 'success'](
      expired ? 'Session expired. Please sign in again.' : 'Logged out successfully'
    )
  }

  const updateUser = (data) => {
    const updated = buildUser(data, user || {})
    setUser(updated)
    localStorage.setItem(USER_KEY, JSON.stringify(updated))
    return updated
  }

  useEffect(() => {
    if (!user) return undefined
    const refreshSession = () => {
      if (localStorage.getItem(TOKEN_KEY)) setSessionExpiry()
    }
    const activityEvents = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart']
    activityEvents.forEach(e => window.addEventListener(e, refreshSession, { passive: true }))
    const interval = window.setInterval(() => {
      if (isSessionExpired()) logout({ expired: true })
    }, 30000)
    return () => {
      activityEvents.forEach(e => window.removeEventListener(e, refreshSession))
      window.clearInterval(interval)
    }
  }, [user])

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register,
      googleLogin,
      logout, updateUser,
      isAdmin: isAdminRole(user?.role)
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { isAdminRole, normalizeRole }