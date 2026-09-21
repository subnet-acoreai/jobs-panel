import { useState } from 'react'
import { useApi } from '../lib/useApi'

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021]
const REASONS = ['All reasons', 'AI pivot', 'Market conditions', 'Restructuring', 'Bankruptcy', 'Acquisition', 'Regulatory', 'Other']

function money(value) {
  if (value == null) return '—'
  return `−${Number(value).toLocaleString()}`
}

export default function Layoffs() {
  const [year, setYear] = useState(2026)
  const [reason, setReason] = useState('All reasons')
  const { data, loading, error } = useApi(`/api/layoffs?year=${year}&reason=${encodeURIComponent(reason)}`)
  const summary = data?.summary
  const rows = data?.layoffs || []

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8">
      <h1 className="text-[26px] font-extrabold tracking-tight sm:text-3xl">Crypto Layoffs Report {year}</h1>
      <p className="mt-2 text-sm leading-6 text-gray-500">
        Tracking job cuts across crypto, Web3 and blockchain from public announcements.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {YEARS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setYear(item)}
            className={`rounded-full px-3 py-1 text-sm ${year === item ? 'bg-brand text-white' : 'bg-gray-100 dark:bg-white/10'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {REASONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setReason(item)}
            className={`rounded-full px-3 py-1 text-xs ${reason === item ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'bg-gray-100 dark:bg-white/10'}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          [`${(summary?.jobsCut || 0).toLocaleString()}+`, 'Total jobs cut'],
          [summary?.companies || 0, 'Companies affected'],
          [summary?.biggest?.jobs ? summary.biggest.jobs.toLocaleString() : '—', summary?.biggest ? `Biggest cut · ${summary.biggest.company}` : 'Biggest cut'],
          [summary?.primaryReason || '—', 'Primary reason'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-gray-200 p-4 dark:border-night-line">
            <p className="text-xl font-extrabold">{loading ? '…' : value}</p>
            <p className="mt-1 text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {error ? <p className="mt-6 text-sm text-red-500">{error}</p> : null}

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-night-line">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-white/5">
            <tr>
              <th className="px-4 py-2 font-semibold">Company</th>
              <th className="px-4 py-2 font-semibold">Jobs cut</th>
              <th className="px-4 py-2 font-semibold">% of workforce</th>
              <th className="px-4 py-2 font-semibold">Date</th>
              <th className="px-4 py-2 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.company}-${row.date}-${i}`} className="border-t border-gray-100 dark:border-night-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{row.company}</p>
                  <p className="text-xs text-gray-400">{row.sector}</p>
                </td>
                <td className="px-4 py-3">{money(row.jobs)}</td>
                <td className="px-4 py-3">{row.percent != null ? `${row.percent}%` : '—'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(row.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && !rows.length ? <p className="mt-6 text-sm text-gray-400">No public 2026-style tracker rows for this year in the local index.</p> : null}
    </div>
  )
}
