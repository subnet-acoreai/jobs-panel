import { formatApplicants, formatPostedOn, jobPostedLabel } from '../data/site'

export default function JobStats({ job, variant = 'compact', className = '' }) {
  const relative = jobPostedLabel(job)
  const date = formatPostedOn(job)
  const posted =
    variant === 'long'
      ? date
        ? `Posted ${date}`
        : relative
          ? `Posted ${relative === 'Today' ? 'today' : relative}`
          : ''
      : relative
  const applicants = formatApplicants(job?.applicants)
  if (!posted && !applicants) return null

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted ${className}`}>
      {posted ? <span>{posted}</span> : null}
      {posted && applicants ? <span aria-hidden="true">·</span> : null}
      {applicants ? <span>{applicants}</span> : null}
    </span>
  )
}
