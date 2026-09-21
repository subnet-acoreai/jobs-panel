import { useMemo, useState } from 'react'
import { usd, useApi } from '../lib/useApi'

const ROLES = ['Developer', 'Solidity', 'Product', 'Design', 'Marketing', 'Community', 'Sales', 'Legal', 'Finance']

export default function Salaries() {
  const { data, loading, error } = useApi('/api/salaries')
  const [role, setRole] = useState('Developer')
  const [experience, setExperience] = useState(4)
  const [location, setLocation] = useState('Remote')
  const [estimate, setEstimate] = useState(null)
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const live = data?.live
  const headline = data?.headline

  async function calculate(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch('/api/salaries/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, experience, location, remote: /remote/i.test(location) }),
      })
      const payload = await res.json()
      setEstimate(payload.estimate)
    } finally {
      setBusy(false)
    }
  }

  const rows = useMemo(() => data?.roles || [], [data])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-5 sm:py-8">
      <h1 className="text-[26px] font-extrabold tracking-tight sm:text-3xl">Crypto & Web3 Salaries</h1>
      <p className="mt-2 text-sm text-gray-500">
        Benchmark against community reports and live listings. Figures in USD, cash-only.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          [usd(live?.mean || headline?.average), 'Live listing average'],
          [usd(live?.p10 || headline?.p10), 'Bottom 10%'],
          [usd(live?.p90 || headline?.p90), 'Top 10%'],
          [headline?.approved?.toLocaleString() || '7,122', 'Approved salaries'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-gray-200 p-4 dark:border-night-line">
            <p className="text-xl font-extrabold text-brand">{loading ? '…' : value}</p>
            <p className="mt-1 text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={calculate} className="mt-8 rounded-2xl border border-gray-200 p-5 dark:border-night-line">
        <h2 className="text-lg font-bold">Salary calculator</h2>
        <p className="mt-1 text-sm text-gray-500">Uses published role bands, adjusted for experience and location.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="text-gray-500">Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-night-line dark:bg-night-card">
              {ROLES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-gray-500">Years of experience</span>
            <input type="number" min="0" value={experience} onChange={(e) => setExperience(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-night-line dark:bg-night-card" />
          </label>
          <label className="text-sm">
            <span className="text-gray-500">Location</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote, New York, India…" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-night-line dark:bg-night-card" />
          </label>
        </div>
        <button disabled={busy} className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          {busy ? 'Calculating…' : 'Estimate salary'}
        </button>
        {estimate ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-400">Bottom 10%</p>
              <p className="text-lg font-bold">{usd(estimate.p10)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Estimated mean</p>
              <p className="text-lg font-bold text-brand">{usd(estimate.mean)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Top 10%</p>
              <p className="text-lg font-bold">{usd(estimate.p90)}</p>
            </div>
          </div>
        ) : null}
      </form>

      <h2 className="mt-10 text-lg font-bold">Annual Web3 salaries for key roles</h2>
      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-night-line">
        <div className="min-w-[520px]">
        <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 dark:bg-white/5">
          <span>Role</span>
          <span>Mean</span>
          <span>P10</span>
          <span>P90</span>
        </div>
        {rows.map((row) => (
          <div key={row.role} className="grid grid-cols-4 border-t border-gray-100 px-4 py-3 text-sm dark:border-night-line">
            <span className="font-medium">{row.role}</span>
            <span>{usd(row.mean)}</span>
            <span className="text-gray-500">{usd(row.p10)}</span>
            <span className="text-gray-500">{usd(row.p90)}</span>
          </div>
        ))}
        </div>
      </div>
      {live?.listings ? (
        <p className="mt-3 text-xs text-gray-400">
          Live listing average from {live.listings} paid jobs in the current feed: {usd(live.mean)}.
        </p>
      ) : null}

      <form
        className="mt-10 rounded-2xl border border-gray-200 p-5 dark:border-night-line"
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(true)
        }}
      >
        <h2 className="text-lg font-bold">Add your salary</h2>
        <p className="mt-1 text-sm text-gray-500">Anonymous. Community review unlocks individual reports.</p>
        {submitted ? (
          <p className="mt-4 text-sm text-brand">Saved locally for this demo. Individual $XXX reports stay gated on the official site.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input required placeholder="Job title" className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-night-line dark:bg-night-card" />
            <input required placeholder="Annual salary (USD)" className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-night-line dark:bg-night-card" />
            <input placeholder="Years of experience" className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-night-line dark:bg-night-card" />
            <input placeholder="Location / Remote" className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-night-line dark:bg-night-card" />
            <button className="sm:col-span-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white">Submit compensation</button>
          </div>
        )}
      </form>
    </div>
  )
}
