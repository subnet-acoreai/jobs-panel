import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BRAND_NAME, CompanyLogo, Tag } from '../components/Brand'
import ApplyForm from '../components/ApplyForm'
import CopyJobButton from '../components/CopyJobButton'
import JobRow from '../components/JobRow'
import { useApp } from '../context/AppContext'
import { useJobs } from '../context/JobsContext'

export default function JobDetail() {
  const { slug } = useParams()
  const { jobs, getJob } = useJobs()
  const { bookmarks, toggleBookmark } = useApp()
  const [job, setJob] = useState(() => jobs.find((j) => j.slug === slug) || null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let live = true
    const cached = jobs.find((j) => j.slug === slug)
    if (cached?.html) {
      setJob(cached)
      setMissing(false)
      return undefined
    }
    if (cached) setJob(cached)
    getJob(slug)
      .then((found) => {
        if (!live) return
        setJob(found)
        setMissing(!found)
      })
      .catch(() => {
        if (live) setMissing(true)
      })
    return () => {
      live = false
    }
  }, [slug, jobs, getJob])

  const similar = useMemo(() => {
    if (!job) return []
    return jobs
      .filter((j) => j.id !== job.id && (j.category === job.category || j.companySlug === job.companySlug))
      .slice(0, 5)
  }, [job, jobs])

  if (missing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Job not found</h1>
        <Link to="/" className="mt-4 inline-block text-brand">
          Back to jobs
        </Link>
      </div>
    )
  }

  if (!job) {
    return <p className="px-4 py-16 text-center text-sm text-gray-500">Loading listing…</p>
  }

  const saved = bookmarks.includes(job.id)
  const html = job.html
  const paragraphs = Array.isArray(job.description) ? job.description : []

  return (
    <div className="mx-auto grid min-w-0 max-w-6xl gap-8 px-4 py-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article className="min-w-0">
        <p className="text-xs text-gray-400">
          <Link to="/" className="hover:text-brand">
            Jobs
          </Link>{' '}
          / {job.company}
        </p>
        <div className="mt-4 flex min-w-0 items-start gap-3 sm:gap-4">
          <CompanyLogo logo={job.logo} name={job.company} size={48} />
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-[26px] font-extrabold tracking-tight sm:text-3xl">{job.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              at{' '}
              <Link to={`/companies/${job.companySlug}`} className="font-medium text-brand">
                {job.company}
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {job.salary && <span className="font-medium text-ink dark:text-white">{job.salary}</span>}
          <span>📍 {job.remote ? 'Remote' : job.location || '—'}</span>
          <span>{job.type}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(job.tags || []).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href="#apply"
            className="inline-flex min-h-11 items-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Apply
          </a>
          <button
            type="button"
            onClick={() => toggleBookmark(job.id)}
            className="min-h-11 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium dark:border-night-line"
          >
            {saved ? 'Saved' : 'Save for later'}
          </button>
          <CopyJobButton job={job} />
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Apply via {BRAND_NAME} · {job.company}
          {job.postedOn ? ` · ${job.postedOn}` : ''}
        </p>

        {html ? (
          <div className="prose-job mt-8" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="prose-job mt-8">
            {paragraphs.map((p) => (
              <p key={p} className="mb-4">
                {p}
              </p>
            ))}
          </div>
        )}
        <ApplyForm job={job} />

        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold">Similar Web3 jobs</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-night-line">
              {similar.map((j) => (
                <JobRow key={j.id} job={j} />
              ))}
            </div>
          </section>
        )}
      </article>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-200 p-5 dark:border-night-line">
          <div className="flex items-center gap-3">
            <CompanyLogo logo={job.logo} name={job.company} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{job.company}</p>
              <p className="truncate text-xs text-gray-500">{job.remote ? 'Remote' : job.location}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-500">{job.summary}</p>
          <Link to={`/companies/${job.companySlug}`} className="mt-3 inline-block text-sm font-medium text-brand">
            View jobs at {job.company}
          </Link>
        </div>
        <div className="rounded-2xl bg-brand p-5 text-white">
          <h3 className="font-bold">Hiring {job.tags?.[0] || 'Web3'} Talent?</h3>
          <p className="mt-2 text-sm text-white/80">Post your jobs and reach crypto-native candidates.</p>
          <Link to="/hire" className="mt-4 inline-block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-brand">
            Start hiring
          </Link>
        </div>
      </aside>
    </div>
  )
}
