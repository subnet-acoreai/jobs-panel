import { Link } from 'react-router-dom'
import { CompanyLogo, Tag } from './Brand'
import { Salary } from './JobListItem'
import JobStats from './JobStats'
import ApplyForm from './ApplyForm'
import CopyJobButton from './CopyJobButton'
import { useApp } from '../context/AppContext'

export default function JobPreview({ job, variant = 'panel' }) {
  const { bookmarks, toggleBookmark } = useApp()
  const sheet = variant === 'sheet'
  if (!job) {
    return (
      <div className="flex h-full min-h-40 items-center justify-center rounded-[28px] border border-black/5 bg-white/70 text-sm text-muted dark:border-white/10 dark:bg-night-card">
        Select a job to preview
      </div>
    )
  }

  const saved = bookmarks.includes(job.id)
  const actions = (
    <div className={`flex min-w-0 items-center gap-2 ${sheet ? 'flex-wrap' : 'mt-4 flex-wrap'}`}>
      <a
        href="#apply"
        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover sm:flex-none"
      >
        Apply
      </a>
      <button
        type="button"
        onClick={() => toggleBookmark(job.id)}
        className="inline-flex min-h-11 items-center rounded-full border border-line px-3 py-2 text-sm text-muted dark:border-night-line"
      >
        {saved ? 'Saved' : 'Save'}
      </button>
      <Link
        to={`/jobs/${job.slug}`}
        className="inline-flex min-h-11 items-center rounded-full border border-line px-3 py-2 text-sm text-muted dark:border-night-line"
      >
        Open page
      </Link>
      <CopyJobButton job={job} />
    </div>
  )

  return (
    <section
      className={
        sheet
          ? 'flex h-full flex-col overflow-hidden bg-white dark:bg-night-card'
          : 'flex max-h-[calc(100vh-110px)] flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white/90 shadow-[0_20px_50px_rgba(16,35,28,0.06)] dark:border-white/10 dark:bg-night-card'
      }
    >
      <div className={`border-b border-line dark:border-night-line ${sheet ? 'px-4 py-3' : 'px-5 py-5 sm:px-6'}`}>
        {job.featured ? <p className="text-[13px] font-medium text-amber-500">⭐ Featured Opportunity</p> : null}
        <div className="mt-1 flex items-start gap-3">
          <CompanyLogo logo={job.logo} name={job.company} size={sheet ? 40 : 48} />
          <div className="min-w-0 flex-1">
            <h2 className="break-words text-[18px] font-extrabold leading-tight tracking-tight sm:text-[26px]">{job.title}</h2>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="font-medium text-ink dark:text-white">{job.company}</span>
              <Salary value={job.salary} />
              <span className="break-words">
                {job.remote ? '📍 Remote' : job.location ? `📍 ${job.location}` : ''}
                {job.type ? ` · ${job.type}` : ''}
              </span>
              <JobStats job={job} variant="long" className="text-sm" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(job.tags || []).slice(0, sheet ? 4 : 6).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>
        </div>
        {sheet ? null : actions}
      </div>

      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${sheet ? 'px-4 py-4' : 'px-5 py-5 sm:px-6'}`}>
        {job.html ? (
          <div className="prose-job" dangerouslySetInnerHTML={{ __html: job.html }} />
        ) : (
          <p className="text-sm leading-7 text-gray-600">{job.summary}</p>
        )}
        <ApplyForm job={job} />
      </div>
      {sheet ? (
        <div className="border-t border-line bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-night-line dark:bg-night-card">
          {actions}
        </div>
      ) : null}
    </section>
  )
}
