import { useMemo, useState } from 'react'
import { BRAND_NAME } from '../components/Brand'
import { useApi } from '../lib/useApi'

export default function Talent() {
  const [q, setQ] = useState('')
  const [remote, setRemote] = useState(false)
  const path = `/api/talent?query=${encodeURIComponent(q)}&remote=${remote ? '1' : '0'}`
  const { data, loading, error } = useApi(path)
  const { data: insights } = useApi('/api/insights')
  const [contacted, setContacted] = useState({})

  const list = data?.talent || []
  const meta = data?.meta
  const skills = useMemo(() => insights?.skills || [], [insights])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <p className="text-sm font-medium text-brand">{(meta?.total || 35118).toLocaleString()}+ pre-vetted professionals</p>
      <h1 className="mt-1 text-[26px] font-extrabold tracking-tight sm:text-3xl">Hire Crypto & Web3 Talent</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
        Browse public talent cards on {BRAND_NAME}. Typical range {meta?.rateRange || '$16–$50/hr'}.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          [(meta?.total || 35118).toLocaleString() + '+', 'candidates'],
          [meta?.rateRange || '$16–$50/hr', 'typical hourly rate'],
          [String(meta?.active30d || 879), 'active in last 30 days'],
          [(meta?.topLocations || []).join(', '), 'top locations'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-gray-200 p-4 dark:border-night-line">
            <p className="text-sm font-bold">{value}</p>
            <p className="mt-1 text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What skills are you hiring for?"
          className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm dark:border-night-line dark:bg-night-card"
        />
        <button
          type="button"
          onClick={() => setRemote((v) => !v)}
          className={`rounded-full border px-4 py-2 text-sm ${remote ? 'border-brand bg-brand text-white' : 'border-gray-200 dark:border-night-line'}`}
        >
          Remote
        </button>
      </div>

      {skills.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.slice(0, 10).map((skill) => (
            <button
              key={skill.name}
              type="button"
              onClick={() => setQ(skill.name)}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-white/10 dark:text-gray-300"
            >
              {skill.name} · {skill.count} jobs
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-6 text-sm text-gray-400">
        Showing {list.length} public profiles. Full directory: {meta?.total?.toLocaleString()}+ on {BRAND_NAME}.
      </p>
      {loading ? <p className="mt-6 text-sm text-gray-400">Loading talent…</p> : null}
      {error ? <p className="mt-6 text-sm text-red-500">{error}</p> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {list.map((person) => (
          <article key={person.id} className="rounded-2xl border border-gray-200 p-5 dark:border-night-line">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-semibold">{person.role}</h2>
                <p className="mt-1 text-xs text-gray-400">
                  {person.location}
                  {person.tz ? ` · ${person.tz}` : ''}
                  {person.remote ? ' · Remote' : ''}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${person.available ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {person.available ? 'Available' : 'Sign in to see rates'}
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              {person.types?.join(' · ')}
              {person.cryptoSince ? ` · In crypto since ${person.cryptoSince}` : ''}
            </p>
            {person.languages?.length ? <p className="mt-1 text-xs text-gray-400">Speaks {person.languages.join(', ')}</p> : null}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(person.skills || []).map((skill) => (
                <span key={skill} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] dark:bg-white/10">
                  {skill}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">Rates: sign in on {BRAND_NAME} to see them.</p>
            <button
              type="button"
              onClick={() => setContacted((c) => ({ ...c, [person.id]: true }))}
              className="mt-4 min-h-11 w-full rounded-full bg-brand py-2 text-sm font-semibold text-white"
            >
              {contacted[person.id] ? 'Message sent' : 'Contact directly'}
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
