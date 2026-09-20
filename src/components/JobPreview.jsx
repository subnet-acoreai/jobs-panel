import { Link } from 'react-router-dom'
import { CompanyLogo, Tag } from './Brand'
import { Salary } from './JobListItem'
import ApplyForm from './ApplyForm'
import { useApp } from '../context/AppContext'

export default function JobPreview({ job }) {
  const { bookmarks, toggleBookmark } = useApp()
  if (!job) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-gray-200 text-sm text-gray-400 dark:border-night-line">
        Select a job to preview
      </div>
    )
  }

  const saved = bookmarks.includes(job.id)

  return (
    <section className="flex h-[calc(100vh-90px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-night-line dark:bg-night-card">
      <div className="border-b border-gray-100 px-6 py-5 dark:border-night-line">
        {job.featured ? <p className="text-[13px] font-medium text-amber-500">⭐ Featured Opportunity</p> : null}
        <div className="mt-3 flex items-start gap-3">
          <CompanyLogo logo={job.logo} name={job.company} size={48} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[26px] font-extrabold leading-tight tracking-tight">{job.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              <span className="font-medium text-ink dark:text-white">{job.company}</span>
              <Salary value={job.salary} />
              <span>
                {job.remote ? '📍 Remote' : job.location ? `📍 ${job.location}` : ''}
                {job.type ? ` · ${job.type}` : ''}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(job.tags || []).slice(0, 6).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href="#apply"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Apply
          </a>
          <button
            type="button"
            onClick={() => toggleBookmark(job.id)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 dark:border-night-line"
          >
            {saved ? 'Saved' : 'Save for later'}
          </button>
          <Link
            to={`/jobs/${job.slug}`}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 dark:border-night-line"
          >
            New tab
          </Link>
          <span className="ml-auto text-xs text-gray-400">
            Posted by {job.company}
            {job.postedOn ? ` ${job.postedOn}` : ''}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {job.html ? (
          <div className="prose-job" dangerouslySetInnerHTML={{ __html: job.html }} />
        ) : (
          <p className="text-sm leading-7 text-gray-600">{job.summary}</p>
        )}
        <ApplyForm job={job} />
      </div>
    </section>
  )
}
