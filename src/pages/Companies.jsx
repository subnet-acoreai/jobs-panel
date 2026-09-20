import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CompanyLogo, Tag } from '../components/Brand'
import { useJobs } from '../context/JobsContext'

export default function Companies() {
  const { companies, jobs, loading, error, source, loadJobs } = useJobs()

  useEffect(() => {
    if (!jobs.length) loadJobs().catch(() => {})
  }, [jobs.length, loadJobs])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-medium text-brand">
        {companies.length} companies hiring
        {source ? ' · live from CryptoJobsList' : ''}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Crypto Companies & Web3 Projects</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
        Companies with live listings in the current CryptoJobsList feed.
      </p>
      {loading ? (
        <p className="mt-8 text-sm text-gray-500">Loading companies…</p>
      ) : error ? (
        <p className="mt-8 text-sm text-red-500">{error}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link
              key={c.slug}
              to={`/companies/${c.slug}`}
              className="rounded-2xl border border-gray-200 p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm dark:border-night-line"
            >
              <div className="flex items-start gap-3">
                <CompanyLogo company={c} logo={c.logo} name={c.name} />
                <div>
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="text-xs text-gray-400">{c.location}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">{c.tagline}</p>
              {c.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.tags.slice(0, 3).map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              ) : null}
              <p className="mt-4 text-sm font-medium text-brand">
                View {c.open} Open Vacanc{c.open === 1 ? 'y' : 'ies'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
