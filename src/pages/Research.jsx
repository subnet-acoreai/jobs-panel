import { Link } from 'react-router-dom'
import { useApi } from '../lib/useApi'

export default function Research() {
  const { data, loading, error } = useApi('/api/research')
  const trends = data?.trends
  const reports = data?.reports || []
  const featured = reports.find((r) => r.featured) || reports[0]

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">CryptoJobsList Research</h1>
      <p className="mt-2 text-sm text-gray-500">
        Workforce data on salary premiums, hiring hubs, and tooling — sourced from the job board.
      </p>

      {featured ? (
        <a
          href={featured.url}
          target="_blank"
          rel="noreferrer"
          className="mt-8 block rounded-2xl border border-gray-200 p-6 hover:border-brand/40 dark:border-night-line"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Featured Report · {featured.date}</p>
          <h2 className="mt-2 text-2xl font-bold">{featured.title}</h2>
          <p className="mt-3 text-sm leading-7 text-gray-500">{featured.summary}</p>
        </a>
      ) : null}

      <h2 className="mt-10 text-lg font-bold">Web3 Hiring Trends</h2>
      <p className="mt-1 text-sm text-gray-500">Live from the CryptoJobsList jobs feed.</p>
      {loading ? <p className="mt-4 text-sm text-gray-400">Loading trends…</p> : null}
      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      {trends ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-4 dark:border-night-line">
              <p className="text-2xl font-extrabold">{trends.totalJobs}</p>
              <p className="text-xs text-gray-500">Live jobs in catalog</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 dark:border-night-line">
              <p className="text-2xl font-extrabold">{trends.companies}</p>
              <p className="text-xs text-gray-500">Companies hiring</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 dark:border-night-line">
              <p className="text-2xl font-extrabold">{trends.remoteShare}%</p>
              <p className="text-xs text-gray-500">Remote roles</p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">In-demand titles</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {trends.titles.map((item) => (
                  <li key={item.name} className="flex justify-between gap-3">
                    <span className="truncate">{item.name}</span>
                    <span className="text-gray-400">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Trending skills</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {trends.skills.map((item) => (
                  <li key={item.name} className="flex justify-between gap-3">
                    <span>{item.name}</span>
                    <span className="text-gray-400">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/layoffs" className="rounded-xl border border-gray-200 p-4 dark:border-night-line">
          <h3 className="font-semibold">Crypto Layoffs Tracker</h3>
          <p className="mt-1 text-sm text-gray-500">Public announcements aggregated over time.</p>
        </Link>
        <Link to="/salaries" className="rounded-xl border border-gray-200 p-4 dark:border-night-line">
          <h3 className="font-semibold">Salary calculator</h3>
          <p className="mt-1 text-sm text-gray-500">Role bands plus live listing averages.</p>
        </Link>
        {reports
          .filter((r) => !r.featured)
          .map((report) => (
            <a key={report.slug} href={report.url} target="_blank" rel="noreferrer" className="rounded-xl border border-gray-200 p-4 dark:border-night-line">
              <p className="text-xs text-gray-400">{report.date}</p>
              <h3 className="mt-1 font-semibold">{report.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{report.summary}</p>
            </a>
          ))}
      </div>
    </div>
  )
}
