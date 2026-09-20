import { Link } from 'react-router-dom'
import { CompanyLogo, Tag } from './Brand'
import { formatPosted } from '../data/site'
import { useApp } from '../context/AppContext'

export default function JobRow({ job }) {
  const { bookmarks, toggleBookmark } = useApp()
  const saved = bookmarks.includes(job.id)
  const posted = formatPosted(job.postedDaysAgo)

  return (
    <article className="group relative border-b border-gray-100 last:border-0 hover:bg-gray-50/80 dark:border-night-line dark:hover:bg-white/[0.03]">
      <Link
        to={`/jobs/${job.slug}`}
        className="grid items-center gap-3 px-3 py-3.5 sm:px-4 lg:grid-cols-[1fr_140px_160px_1fr_52px]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <CompanyLogo logo={job.logo} name={job.company} />
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-ink group-hover:text-brand dark:text-white">
              {job.featured && <span className="mr-1 text-[13px]">⭐</span>}
              {job.title}
            </h3>
            <p className="truncate text-sm text-gray-500">{job.company}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 lg:hidden">
              {job.salary ? <span className="text-xs text-gray-500">{job.salary}</span> : null}
              <span className="text-xs text-gray-500">{job.remote ? '📍 Remote' : `📍 ${job.location || '—'}`}</span>
              {(job.tags || []).slice(0, 3).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              {posted ? <span className="text-xs text-gray-400">{posted}</span> : null}
            </div>
          </div>
        </div>
        <p className="hidden truncate text-sm text-gray-500 lg:block">{job.salary || '—'}</p>
        <p className="hidden truncate text-sm text-gray-500 lg:block">
          {job.remote ? '📍 Remote' : `📍 ${job.location || '—'}`}
        </p>
        <div className="hidden flex-wrap gap-1 lg:flex">
          {(job.tags || []).slice(0, 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <p className="hidden text-right text-xs text-gray-400 lg:block">{posted || 'Live'}</p>
      </Link>
      <button
        type="button"
        aria-label={saved ? 'Remove bookmark' : 'Save job'}
        onClick={() => toggleBookmark(job.id)}
        className={`absolute right-2 top-2 hidden h-8 w-8 items-center justify-center rounded-md text-gray-300 opacity-0 hover:text-brand group-hover:opacity-100 lg:flex ${saved ? 'text-brand opacity-100' : ''}`}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M6 4h12v16l-6-3-6 3V4z" />
        </svg>
      </button>
    </article>
  )
}
