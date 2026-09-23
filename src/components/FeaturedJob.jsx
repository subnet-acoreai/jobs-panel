import { Link } from 'react-router-dom'
import { CompanyLogo, Tag } from './Brand'
import JobStats from './JobStats'
import { useApp } from '../context/AppContext'

export default function FeaturedJob({ job }) {
  const { bookmarks, toggleBookmark } = useApp()
  const saved = bookmarks.includes(job.id)
  const applyHref = job.canonicalURL || `/jobs/${job.slug}`

  return (
    <section className="overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-b from-brand-soft/60 to-white dark:from-brand/15 dark:to-night-card">
      <div className="flex items-center gap-2 border-b border-brand/10 px-5 py-3 text-sm font-semibold text-brand">
        <span>⭐</span> Featured Opportunity
      </div>
      <div className="px-5 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <CompanyLogo logo={job.logo} name={job.company} size={56} />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold tracking-tight">
              <Link to={`/jobs/${job.slug}`} className="hover:text-brand">
                {job.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {job.company}
              {job.salary ? ` · ${job.salary}` : ''}
              {' · '}
              {job.remote ? 'Remote' : job.location}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(job.tags || []).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-5 max-w-3xl text-[15px] leading-7 text-gray-600 dark:text-gray-300">{job.summary}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={applyHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Apply
          </a>
          <button
            type="button"
            onClick={() => toggleBookmark(job.id)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-night-line dark:hover:bg-white/5"
          >
            {saved ? 'Saved' : 'Save for later'}
          </button>
          <Link to={`/jobs/${job.slug}`} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-ink">
            Details
          </Link>
        </div>
        <p className="mt-4 flex flex-wrap items-center gap-x-2 text-xs text-gray-400">
          <span>Posted by {job.company}</span>
          <JobStats job={job} variant="long" className="text-xs text-gray-400" />
        </p>
      </div>
    </section>
  )
}
