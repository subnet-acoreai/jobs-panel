import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CompanyLogo, Tag } from '../components/Brand'
import JobRow from '../components/JobRow'
import { useJobs } from '../context/JobsContext'

export default function CompanyDetail() {
  const { slug } = useParams()
  const { jobs, companies } = useJobs()
  const [payload, setPayload] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    const localJobs = jobs.filter((j) => j.companySlug === slug)
    const localCompany = companies.find((c) => c.slug === slug)
    if (localCompany) {
      setPayload({ company: localCompany, jobs: localJobs })
      setMissing(false)
      return
    }
    let live = true
    fetch(`/api/companies/${encodeURIComponent(slug)}`)
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!live) return
        if (!ok) setMissing(true)
        else setPayload(data)
      })
      .catch(() => {
        if (live) setMissing(true)
      })
    return () => {
      live = false
    }
  }, [slug, jobs, companies])

  if (missing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Company not found</h1>
        <Link to="/companies" className="mt-4 inline-block text-brand">
          All companies
        </Link>
      </div>
    )
  }

  if (!payload) {
    return <p className="px-4 py-16 text-center text-sm text-gray-500">Loading company…</p>
  }

  const { company, jobs: open } = payload

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 p-6 sm:flex-row dark:border-night-line">
        <CompanyLogo company={company} logo={company.logo} name={company.name} size={72} />
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-[26px] font-extrabold tracking-tight sm:text-3xl">{company.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{company.location}</p>
          {company.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {company.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          ) : null}
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">{company.about}</p>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold">Live jobs at {company.name}</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-night-line">
        {open.length ? open.map((j) => <JobRow key={j.id} job={j} />) : <p className="p-6 text-sm text-gray-500">No live roles in this feed.</p>}
      </div>
    </div>
  )
}
