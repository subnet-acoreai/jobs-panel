import { useMemo } from 'react'
import { useApi } from '../lib/useApi'

function monthLabel(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

function dateRange(event) {
  const start = new Date(`${event.start}T00:00:00`)
  const end = event.end ? new Date(`${event.end}T00:00:00`) : start
  const same = start.toDateString() === end.toDateString()
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  return same ? fmt(start) : `${fmt(start)} - ${fmt(end)}`
}

export default function Events() {
  const { data, loading, error } = useApi('/api/events')
  const groups = useMemo(() => {
    const map = new Map()
    for (const event of data?.events || []) {
      const key = monthLabel(event.start)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(event)
    }
    return [...map.entries()]
  }, [data])

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Crypto Events in 2026</h1>
      <p className="mt-2 text-sm text-gray-500">
        Web3 events, expos, conferences and hackathons listed on{' '}
        <a className="text-brand" href="https://cryptojobslist.com/crypto-events" target="_blank" rel="noreferrer">
          CryptoJobsList
        </a>
        .
      </p>
      {loading ? <p className="mt-8 text-sm text-gray-400">Loading events…</p> : null}
      {error ? <p className="mt-8 text-sm text-red-500">{error}</p> : null}
      <div className="mt-8 space-y-8">
        {groups.map(([month, items]) => (
          <section key={month}>
            <h2 className="text-lg font-bold">{month}</h2>
            <div className="mt-3 space-y-3">
              {items.map((event) => (
                <article key={`${event.name}-${event.start}`} className="rounded-xl border border-gray-200 px-4 py-3 dark:border-night-line">
                  <h3 className="font-semibold">{event.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {dateRange(event)}
                    {event.city ? ` · ${event.city}` : ''}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
