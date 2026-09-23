import { CompanyLogo } from './Brand'
import JobStats from './JobStats'

export function Salary({ value }) {
  if (!value) return null
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-brand">
      <span className="inline-flex h-[15px] w-[15px] items-center justify-center rounded-full bg-brand text-[9px] font-bold leading-none text-white">
        $
      </span>
      {String(value).replace(/^\$/, '')}
    </span>
  )
}

function Pin({ children }) {
  if (!children) return null
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-1 text-[12px] text-muted">
      <svg className="h-[14px] w-[14px] shrink-0 text-brand" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
      </svg>
      <span className="truncate">{children}</span>
    </span>
  )
}

export default function JobListItem({ job, selected, onSelect }) {
  const place = job.location || (job.remote ? 'Remote' : '')
  const tags = (job.tags || []).filter((tag) => !(place && tag.toLowerCase() === 'remote' && /remote/i.test(place)))

  return (
    <button
      type="button"
      onClick={() => onSelect(job)}
      className={`w-full rounded-2xl px-2.5 py-2.5 text-left transition sm:px-3 sm:py-3 ${
        selected
          ? 'bg-brand-soft ring-1 ring-brand/20 dark:bg-brand/15 dark:ring-brand/30'
          : 'hover:bg-page dark:hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        <CompanyLogo logo={job.logo} name={job.company} size={40} />
        <div className="min-w-0 flex-1">
          <p className="break-words text-[14px] leading-5 sm:truncate sm:text-[15px] sm:leading-6">
            <span className="font-semibold text-ink dark:text-white">{job.title}</span>
            <span className="text-muted">
              {' '}
              at <span className="font-semibold text-ink dark:text-white">{job.company}</span>
            </span>
          </p>
          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <Salary value={job.salary} />
            <Pin>{place}</Pin>
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex max-w-[120px] items-center truncate rounded-full bg-page px-2 py-[2px] text-[11px] text-muted dark:bg-night sm:max-w-none sm:px-2.5"
              >
                {tag}
              </span>
            ))}
            {tags.slice(2, 5).map((tag) => (
              <span
                key={tag}
                className="hidden items-center rounded-full bg-page px-2.5 py-[2px] text-[11px] text-muted sm:inline-flex dark:bg-night"
              >
                {tag}
              </span>
            ))}
            <JobStats job={job} />
          </div>
        </div>
      </div>
    </button>
  )
}
