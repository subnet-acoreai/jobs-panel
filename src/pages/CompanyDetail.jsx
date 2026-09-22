import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CompanyLogo, Tag } from '../components/Brand'
import JobRow from '../components/JobRow'

function socialHref(kind, value) {
  const text = String(value || '').trim()
  if (!text) return ''
  if (/^https?:\/\//i.test(text)) return text
  if (kind === 'twitter') return `https://x.com/${text.replace(/^@/, '')}`
  if (kind === 'github') return `https://github.com/${text.replace(/^@/, '')}`
  return text
}

function Fact({ label, value }) {
  if (!String(value || '').trim()) return null
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-4 dark:border-night-line dark:bg-night-card">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm leading-6 text-ink dark:text-white">{value}</p>
    </div>
  )
}

export default function CompanyDetail() {
  const { slug } = useParams()
  const [payload, setPayload] = useState(null)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    setPayload(null)
    setMissing(false)
    setError('')
    fetch(`/api/companies/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!live) return
        if (!res.ok) {
          setMissing(true)
          setError(data.message || 'Company not found')
          return
        }
        setPayload(data)
      })
      .catch(() => {
        if (live) {
          setMissing(true)
          setError('Could not load this company')
        }
      })
    return () => {
      live = false
    }
  }, [slug])

  if (missing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Company not found</h1>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <Link to="/companies" className="mt-4 inline-block text-brand">
          All companies
        </Link>
      </div>
    )
  }

  if (!payload) {
    return <p className="px-4 py-16 text-center text-sm text-gray-500">Loading company…</p>
  }

  const { company, jobs: open = [], related = [] } = payload
  const website = socialHref('web', company.website)
  const twitter = socialHref('twitter', company.twitter)
  const github = socialHref('github', company.github)
  const discord = socialHref('web', company.discord)
  const about = company.html || (company.about ? `<p>${company.about}</p>` : '')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs text-gray-400">
        <Link to="/companies" className="hover:text-brand">
          Companies
        </Link>
        {' / '}
        {company.name}
      </p>

      <div className="mt-4 flex flex-col gap-5 rounded-2xl border border-gray-200 p-5 sm:flex-row sm:p-6 dark:border-night-line">
        <CompanyLogo company={company} logo={company.logo} name={company.name} size={72} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="break-words text-[26px] font-extrabold tracking-tight sm:text-3xl">{company.name}</h1>
            {company.verified ? (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">Verified</span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {[company.location, company.lastActive, company.open ? `${company.open} open role${company.open === 1 ? '' : 's'}` : '']
              .filter(Boolean)
              .join(' · ')}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {website ? (
              <a href={website} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">
                Website
              </a>
            ) : null}
            {twitter ? (
              <a href={twitter} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                X
              </a>
            ) : null}
            {github ? (
              <a href={github} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                GitHub
              </a>
            ) : null}
            {discord ? (
              <a href={discord} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                Discord
              </a>
            ) : null}
          </div>
          {company.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {company.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {about ? (
        <div className="prose-job mt-8 max-w-3xl" dangerouslySetInnerHTML={{ __html: about }} />
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Founded" value={company.founded} />
        <Fact label="Team" value={company.currentTeam} />
        <Fact label="Tech stack" value={company.techStack} />
        <Fact label="Funding" value={company.funding} />
        <Fact label="Vacation" value={company.vacationPolicy} />
      </div>

      {company.culture ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Culture</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600 dark:text-gray-300">{company.culture}</p>
        </section>
      ) : null}

      {company.interviewProcess ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Interview process</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600 dark:text-gray-300">{company.interviewProcess}</p>
        </section>
      ) : null}

      <h2 className="mt-10 text-xl font-bold">Live jobs at {company.name}</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-night-line">
        {open.length ? open.map((job) => <JobRow key={job.id || job.slug} job={job} />) : <p className="p-6 text-sm text-gray-500">No live roles in this feed.</p>}
      </div>

      {related.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Similar companies</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                to={`/companies/${item.slug}`}
                className="rounded-2xl border border-gray-200 p-4 transition hover:border-brand/40 dark:border-night-line"
              >
                <div className="flex items-start gap-3">
                  <CompanyLogo logo={item.logo} name={item.name} />
                  <div className="min-w-0">
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.tagline}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
