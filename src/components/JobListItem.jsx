import { CompanyLogo } from './Brand'

export function Salary({ value }) {
  if (!value) return null
  return (
    <span className="inline-flex items-center gap-1 text-[13px] text-emerald-600">
      <span className="inline-flex h-[15px] w-[15px] items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold leading-none text-white">
        $
      </span>
      {String(value).replace(/^\$/, '')}
    </span>
  )
}

function Pin({ children }) {
  if (!children) return null
  return (
    <span className="inline-flex items-center gap-1 text-[13px] text-gray-500">
      <svg className="h-[14px] w-[14px] shrink-0 text-pink-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
      </svg>
      {children}
    </span>
  )
}

export default function JobListItem({ job, selected, onSelect }) {
  const place = job.location || (job.remote ? 'Remote' : '')

  return (
    <button
      type="button"
      onClick={() => onSelect(job)}
      className={`w-full rounded-2xl px-3 py-3 text-left transition ${
        selected
          ? 'bg-white ring-1 ring-gray-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:bg-white/5 dark:ring-night-line'
          : 'hover:bg-white/70 dark:hover:bg-white/[0.03]'
      }`}
    >
      <div className="flex items-start gap-3">
        <CompanyLogo logo={job.logo} name={job.company} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] leading-6">
            <span className="font-medium text-brand">{job.title}</span>
            <span className="text-ink dark:text-white">
              {' '}
              at <span className="font-bold">{job.company}</span>
            </span>
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Salary value={job.salary} />
            <Pin>{place}</Pin>
            {(job.tags || [])
              .filter((tag) => !(place && tag.toLowerCase() === 'remote' && /remote/i.test(place)))
              .slice(0, 5)
              .map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-[2px] text-[12px] text-gray-500 dark:border-night-line dark:bg-transparent"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}
