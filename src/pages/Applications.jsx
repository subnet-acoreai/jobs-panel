import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function fileLink(appId, kind, file, label) {
  if (!file) return null
  return (
    <a
      href={`/api/applications/${appId}/files/${kind}`}
      target="_blank"
      rel="noreferrer"
      className="text-sm font-medium text-brand hover:underline"
    >
      {label}
    </a>
  )
}

export default function Applications() {
  const { user } = useApp()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') return undefined
    fetch('/api/applications', { credentials: 'include' })
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(payload.message || 'Failed to load applications')
        setItems(payload.applications || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace state={{ from: '/applications' }} />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Applications</h1>
      <p className="mt-2 text-sm text-gray-500">Admin inbox. Saved locally on the backend server.</p>

      {loading ? <p className="mt-8 text-sm text-gray-500">Loading…</p> : null}
      {error ? <p className="mt-8 text-sm text-red-500">{error}</p> : null}

      {!loading && !error && items.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">No applications yet. Apply from a job listing to see them here.</p>
      ) : null}

      <div className="mt-6 space-y-4">
        {items.map((app) => (
          <article key={app.id} className="rounded-2xl border border-gray-200 p-5 dark:border-night-line">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">
                  {app.firstName} {app.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {app.jobTitle || 'Untitled role'}
                  {app.company ? ` · ${app.company}` : ''}
                </p>
              </div>
              <p className="text-xs text-gray-400">{new Date(app.createdAt).toLocaleString()}</p>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{app.coverLetter}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>{app.yearsExperience} yrs</span>
              {app.currentSalary ? <span>{app.currentSalary}</span> : null}
              {app.location ? <span>{app.location}</span> : null}
              {app.phone ? <span>{app.phone}</span> : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              {fileLink(app.id, 'resume', app.files?.resume, 'Resume')}
              {fileLink(app.id, 'photo', app.files?.photo, 'Photo')}
              {fileLink(app.id, 'video', app.files?.video, 'Video')}
              {app.jobSlug ? (
                <Link to={`/jobs/${app.jobSlug}`} className="text-sm text-gray-500 hover:text-brand">
                  View job
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
