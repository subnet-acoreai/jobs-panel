import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const JobsContext = createContext(null)

async function getJson(path) {
  const res = await fetch(path)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState([])
  const [companies, setCompanies] = useState([])
  const [meta, setMeta] = useState({ totalCount: 0, page: 1, totalPages: 1, limit: 25 })
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const jobsRef = useRef([])
  jobsRef.current = jobs

  const loadJobs = useCallback(async (params = {}) => {
    const url = new URL('/api/jobs', window.location.origin)
    if (params.query) url.searchParams.set('query', params.query)
    if (params.location) url.searchParams.set('location', params.location)
    if (params.category) url.searchParams.set('category', params.category)
    if (params.tag) url.searchParams.set('tag', params.tag)
    if (params.topic) url.searchParams.set('topic', params.topic)
    if (params.remote) url.searchParams.set('remote', '1')
    url.searchParams.set('page', String(Math.max(1, Number(params.page || 1))))
    const append = Boolean(params.append)
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError('')
    try {
      const data = await getJson(`${url.pathname}${url.search}`)
      const nextJobs = data.jobs || []
      setJobs((prev) => {
        if (!append) return nextJobs
        const seen = new Set(prev.map((job) => job.id || job.slug))
        return [...prev, ...nextJobs.filter((job) => !seen.has(job.id || job.slug))]
      })
      setCompanies((prev) => {
        const incoming = data.companies || []
        if (!append) return incoming
        const seen = new Set(prev.map((company) => company.slug))
        return [...prev, ...incoming.filter((company) => !seen.has(company.slug))]
      })
      setMeta(data.meta || { totalCount: nextJobs.length, page: 1, totalPages: 1, limit: 25 })
      setSource(data.source || '')
      setUpdatedAt(new Date())
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  const getJob = useCallback(async (slug) => {
    const cached = jobsRef.current.find((job) => job.slug === slug)
    if (cached?.html) return cached
    const data = await getJson(`/api/jobs/${encodeURIComponent(slug)}`)
    if (data.job) {
      setJobs((prev) => {
        const index = prev.findIndex((job) => job.slug === slug)
        if (index < 0) return prev
        const next = [...prev]
        next[index] = { ...next[index], ...data.job }
        return next
      })
    }
    return data.job || cached || null
  }, [])

  const value = useMemo(
    () => ({ jobs, companies, meta, source, loading, loadingMore, error, updatedAt, loadJobs, getJob }),
    [jobs, companies, meta, source, loading, loadingMore, error, updatedAt, loadJobs, getJob],
  )

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>
}

export function useJobs() {
  const ctx = useContext(JobsContext)
  if (!ctx) throw new Error('useJobs must be used within JobsProvider')
  return ctx
}
