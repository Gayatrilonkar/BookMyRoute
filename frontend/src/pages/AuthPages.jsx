import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { isAdminRole, useAuth } from '../context/AuthContext'
import { FaBus, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'

function Field({ label, type = 'text', value, onChange, placeholder, required, autoComplete }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-display font-bold text-sm text-secondary">{label}</label>
      <div className="relative">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="input-field pr-10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
    </div>
  )
}

function BusStripe() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-2 flex overflow-hidden rounded-b-3xl">
      {['var(--color-primary)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-error)', 'var(--color-primary)', 'var(--color-warning)', 'var(--color-success)'].map((c, i) => (
        <div key={i} className="flex-1" style={{ background: c }} />
      ))}
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <hr className="flex-1 border-border-light" />
      <span className="text-xs text-text-muted font-body">or continue with</span>
      <hr className="flex-1 border-border-light" />
    </div>
  )
}

function getErrorMessage(err, fallback) {
  return (
    err.response?.data?.message ||
    err.response?.data?.error  ||
    err.message ||
    fallback
  )
}

export function LoginPage() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user   = await login(form.email.trim(), form.password)
      const fallbackPath = isAdminRole(user.role) ? '/admin' : '/search'
      navigate(state?.redirectTo && !isAdminRole(user.role) ? state.redirectTo : fallbackPath, { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to sign in. Please check your credentials.'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const user = await googleLogin(credentialResponse.credential)
      navigate(state?.redirectTo || '/search', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Google sign-in failed. Please try again.'))
    }
  }

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed.')
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary text-white px-5 py-2.5
                          rounded-full border border-primary shadow-sm mb-6">
            <FaBus className="text-warning" />
            <span className="font-display font-bold text-lg tracking-tight">BookMyRoute</span>
          </div>
          <h1 className="text-4xl font-display text-secondary mb-2 font-bold">Welcome back!</h1>
          <p className="text-text-muted font-body">Sign in to continue your journey</p>
        </div>

        <div className="relative card p-8 pb-10">

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field
              label="Email address"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>


              <Divider />
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  text="signin_with"
                  width="100%"
                />
              </div>

          <p className="text-center text-sm text-text-muted mt-6 font-body">
            New to BookMyRoute?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">Create account</Link>
          </p>
          <BusStripe />
        </div>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 8)       { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email.trim(), phone: form.phone, password: form.password })
      navigate('/search', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to create account. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential)
      navigate('/search', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Google sign-up failed. Please try again.'))
    }
  }

  const handleGoogleError = () => {
    toast.error('Google sign-up was cancelled or failed.')
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary text-white px-5 py-2.5
                          rounded-full border border-success shadow-sm mb-6">
            <FaBus className="text-warning" />
            <span className="font-display font-bold text-lg tracking-tight">BookMyRoute</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-secondary mb-2">Create account</h1>
          <p className="text-text-muted font-body">Join thousands of happy travellers</p>
        </div>

        <div className="relative card p-8 pb-10">
          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              shape="rectangular"
              theme="outline"
              size="large"
              text="signup_with"
              width="100%"
            />
          </div>

          <Divider />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Full name"        value={form.name}     onChange={set('name')}     placeholder="Rahul Sharma"     autoComplete="name"         required />
            <Field label="Email address"    type="email"          value={form.email}    onChange={set('email')}    placeholder="you@example.com"  autoComplete="email"        required />
            <Field label="Phone number"     value={form.phone}    onChange={set('phone')}    placeholder="+91 98765 43210"  autoComplete="tel" />
            <Field label="Password"         type="password"       value={form.password} onChange={set('password')} placeholder="Min 8 characters" autoComplete="new-password" required />
            <Field label="Confirm password" type="password"       value={form.confirm}  onChange={set('confirm')}  placeholder="Repeat password"  autoComplete="new-password" required />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6 font-body">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
          <BusStripe />
        </div>
      </div>
    </div>
  )
}