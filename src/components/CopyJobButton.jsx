import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function CopyJobButton({ job, className = '' }) {
  const { user } = useApp()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (user?.role !== 'admin' || !job?.slug) return null

  async function copy() {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/admin/jobs/copy', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job.extraId ? { fromId: job.extraId } : { fromSlug: job.slug }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.message || 'Could not copy job')
      navigate(`/admin/jobs/${payload.job.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className={className}>
      <button
        type="button"
        disabled={busy}
        onClick={copy}
        className="inline-flex min-h-11 items-center rounded-full border border-line px-3 py-2 text-sm text-muted dark:border-night-line disabled:opacity-60"
      >
        {busy ? 'Copying…' : 'Copy to edit'}
      </button>
      {error ? <span className="ml-2 text-xs text-red-500">{error}</span> : null}
    </span>
  )
}
