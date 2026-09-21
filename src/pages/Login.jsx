import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const field =
  'w-full rounded-2xl border border-line bg-page px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-night-line dark:bg-night'
const card =
  'rounded-[22px] border border-black/5 bg-white/80 p-5 shadow-[0_20px_50px_rgba(16,35,28,0.06)] dark:border-white/10 dark:bg-night-card sm:rounded-[28px] sm:p-8'

export default function Login() {
  const { user, setUser } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [mode, setMode] = useState(location.state?.mode === 'signup' ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const path = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const res = await fetch(path, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.message || 'Could not continue')
      setUser(payload.user)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <div className={card}>
          <h1 className="text-[26px] font-extrabold tracking-tight sm:text-3xl">Signed in</h1>
          <p className="mt-2 text-sm text-muted">
            {user.name} · {user.email}
            {user.role === 'admin' ? ' · Admin' : ''}
          </p>
          {user.role === 'admin' ? (
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/admin/jobs" className="text-sm font-medium text-brand">
                Manage additional jobs
              </Link>
              <Link to="/applications" className="text-sm font-medium text-brand">
                View applications
              </Link>
            </div>
          ) : null}
          <button
            type="button"
            onClick={signOut}
            className="mt-6 w-full rounded-full border border-line py-2.5 text-sm font-medium dark:border-night-line"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <div className={card}>
        <h1 className="text-[26px] font-extrabold tracking-tight sm:text-3xl">{mode === 'signup' ? 'Create account' : 'Sign in'}</h1>
        <p className="mt-2 text-sm text-muted">
          {mode === 'signup'
            ? 'Sign up with email to post jobs, save listings, and apply faster.'
            : 'Sign in with your email to continue.'}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-full bg-page p-1 text-sm dark:bg-night">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`rounded-full py-2 font-medium ${mode === 'signin' ? 'bg-ink text-white dark:bg-accent dark:text-ink' : 'text-muted'}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-full py-2 font-medium ${mode === 'signup' ? 'bg-ink text-white dark:bg-accent dark:text-ink' : 'text-muted'}`}
          >
            Sign up
          </button>
        </div>

        <form className="mt-6 space-y-3" onSubmit={submit}>
          {mode === 'signup' ? (
            <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
          ) : null}
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          <input
            required
            type="password"
            minLength={mode === 'signup' ? 8 : undefined}
            placeholder={mode === 'signup' ? 'Password (8+ characters)' : 'Password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button disabled={busy} className="min-h-11 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Continue with email'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button type="button" className="font-medium text-brand" onClick={() => setMode('signin')}>
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button type="button" className="font-medium text-brand" onClick={() => setMode('signup')}>
                Create an account
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
