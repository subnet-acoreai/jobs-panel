import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LogoTicker from '../components/LogoTicker'
import TopicBar from '../components/TopicBar'
import SearchBar from '../components/SearchBar'
import JobListItem from '../components/JobListItem'
import JobPreview from '../components/JobPreview'
import { topicToTag } from '../data/topics'
import { useApp } from '../context/AppContext'
import { useJobs } from '../context/JobsContext'
import { BRAND_NAME } from '../components/Brand'

function pageItems(current, total) {
  if (total <= 1) return [1]
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const items = []
  const push = (value) => {
    if (items[items.length - 1] !== value) items.push(value)
  }
  push(1)
  if (current > 3) push('…')
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page += 1) {
    push(page)
  }
  if (current < total - 2) push('…')
  push(total)
  return items
}

export default function Home() {
  const {
    query,
    setQuery,
    location,
    setLocation,
    setCategory,
    remoteOnly,
    setRemoteOnly,
    sort,
    setSort,
    bookmarks,
    showBookmarks,
    setShowBookmarks,
  } = useApp()
  const { jobs, companies, meta, loading, loadingMore, error, loadJobs, getJob } = useJobs()
  const [params, setParams] = useSearchParams()
  const [topic, setTopic] = useState(() => params.get('topic') || (params.get('remote') ? 'remote' : 'for-you'))
  const [page, setPage] = useState(() => Math.max(1, Number(params.get('page') || 1)))
  const [selectedSlug, setSelectedSlug] = useState(null)
  const [ready, setReady] = useState(false)
  const [mobilePreview, setMobilePreview] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true,
  )
  const firstLoad = useRef(true)
  const tag = topicToTag(topic)
  const remote = remoteOnly || topic === 'remote'

  useEffect(() => {
    const q = params.get('q') || params.get('query')
    const loc = params.get('location')
    const remoteParam = params.get('remote')
    const cat = params.get('category')
    const nextSort = params.get('sort')
    if (q) setQuery(q)
    if (loc) setLocation(loc)
    if (remoteParam) setRemoteOnly(true)
    if (cat) setCategory(cat)
    if (nextSort) setSort(nextSort)
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ready) return
    const requested = firstLoad.current ? Math.max(1, Number(params.get('page') || 1)) : 1
    firstLoad.current = false
    setPage(requested)
    const handle = setTimeout(() => {
      loadJobs({
        query,
        location,
        tag,
        remote,
        page: requested,
      }).catch(() => {})
    }, query || location ? 280 : 0)
    return () => clearTimeout(handle)
  }, [ready, query, location, tag, remote, loadJobs])

  useEffect(() => {
    if (!ready) return
    const next = new URLSearchParams()
    if (query.trim()) next.set('q', query.trim())
    if (location.trim()) next.set('location', location.trim())
    if (remote) next.set('remote', '1')
    if (topic && topic !== 'for-you') next.set('topic', topic)
    if (sort && sort !== 'recent') next.set('sort', sort)
    if (page > 1) next.set('page', String(page))
    setParams(next, { replace: true })
  }, [query, location, remote, topic, sort, page, ready, setParams])

  const visible = useMemo(() => {
    if (showBookmarks) return jobs.filter((job) => bookmarks.includes(job.id))
    return jobs
  }, [jobs, showBookmarks, bookmarks])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      setIsDesktop(mq.matches)
      if (mq.matches) setMobilePreview(false)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    setMobilePreview(false)
  }, [query, location, topic, page, showBookmarks])

  useEffect(() => {
    if (!visible.length) {
      setSelectedSlug(null)
      return
    }
    if (!visible.some((job) => job.slug === selectedSlug)) {
      if (isDesktop) setSelectedSlug(visible[0].slug)
      else {
        setSelectedSlug(null)
        setMobilePreview(false)
      }
    }
  }, [visible, selectedSlug, isDesktop])

  const selected = visible.find((job) => job.slug === selectedSlug) || (isDesktop ? visible[0] : null)

  useEffect(() => {
    if (!selected?.slug || selected.html) return
    getJob(selected.slug).catch(() => {})
  }, [selected?.slug, selected?.html, getJob])

  useEffect(() => {
    if (!mobilePreview) return undefined
    document.body.classList.add('lock-scroll')
    const onKey = (event) => {
      if (event.key === 'Escape') setMobilePreview(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('lock-scroll')
      window.removeEventListener('keydown', onKey)
    }
  }, [mobilePreview])

  function onTopic(id) {
    setTopic(id)
    setShowBookmarks(false)
    setPage(1)
    if (id === 'remote') setRemoteOnly(true)
    else setRemoteOnly(false)
    setCategory('')
  }

  function goToPage(nextPage) {
    const totalPages = meta.totalPages || 1
    const clamped = Math.min(totalPages, Math.max(1, nextPage))
    setPage(clamped)
    loadJobs({
      query,
      location,
      tag,
      remote,
      page: clamped,
    }).catch(() => {})
  }

  async function loadMore() {
    const nextPage = (meta.page || page) + 1
    if (nextPage > (meta.totalPages || 1)) return
    await loadJobs({
      query,
      location,
      tag,
      remote,
      page: nextPage,
      append: true,
    })
    setPage(nextPage)
  }

  const totalCount = meta.totalCount || visible.length
  const limit = meta.limit || 8
  const currentPage = meta.page || page
  const totalPages = meta.totalPages || 1
  const viewed = Math.min(Math.max(visible.length, currentPage * limit), totalCount || visible.length)
  const keyword = meta.keyword || 'Crypto'

  return (
    <div className="mesh-hero mx-auto flex w-full min-w-0 max-w-[1200px] flex-1 flex-col px-3 pt-3 sm:px-5 sm:pb-12 sm:pt-8 max-lg:min-h-0 max-lg:overflow-hidden max-lg:pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:h-auto lg:overflow-visible">
      <div className="shrink-0">
        <p className="inline-flex rounded-full bg-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
          {BRAND_NAME}
        </p>
        <h1 className="mt-2 max-w-3xl text-[24px] font-extrabold leading-[1.08] tracking-tight sm:mt-4 sm:text-[48px]">
          Find your next career on Web3.
        </h1>
        <p className="mt-2 hidden max-w-xl text-[14px] leading-6 text-muted sm:mt-3 sm:block sm:text-[15px]">
          Engineering, product, and ops jobs across protocols, exchanges, and onchain startups — updated daily.
        </p>
        <div className="hidden sm:block">
          <LogoTicker companies={companies} />
        </div>
      </div>

      <div className="mt-3 w-full min-w-0 shrink-0 overflow-hidden rounded-[22px] border border-black/5 bg-white/80 p-3 shadow-[0_20px_50px_rgba(16,35,28,0.06)] backdrop-blur dark:border-white/10 dark:bg-night-card/80 sm:mt-6 sm:rounded-[28px] sm:p-4">
        <TopicBar active={topic} onSelect={onTopic} />
        <div className="mt-3 sm:mt-4">
          <SearchBar />
        </div>
      </div>

      <div className="mt-3 grid min-h-0 w-full min-w-0 flex-1 items-stretch gap-5 lg:mt-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
        <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white/70 p-2 dark:border-white/10 dark:bg-night-card/70 sm:rounded-[28px] sm:p-3">
          <div className="mb-2 flex shrink-0 items-center justify-between gap-3 px-2 text-[13px] text-muted">
            <p>{loading ? 'Loading live jobs…' : `${totalCount.toLocaleString()} open roles`}</p>
            <button
              type="button"
              onClick={() => setShowBookmarks((v) => !v)}
              className={`inline-flex min-h-9 items-center gap-1 ${showBookmarks ? 'text-brand' : 'hover:text-ink'}`}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={showBookmarks ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M6 4h12v16l-6-3-6 3V4z" />
              </svg>
              Saved
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden overscroll-contain pr-0 sm:pr-1">
            {loading && !visible.length ? (
              <p className="px-2 py-10 text-center text-sm text-gray-400">Loading live jobs…</p>
            ) : error && !visible.length ? (
              <p className="px-2 py-10 text-center text-sm text-red-500">{error}</p>
            ) : visible.length === 0 ? (
              <p className="px-2 py-10 text-center text-sm text-gray-400">
                No jobs match these filters.
                {query || location || remote || tag ? (
                  <>
                    {' '}
                    <button
                      type="button"
                      className="text-brand"
                      onClick={() => {
                        setQuery('')
                        setLocation('')
                        setRemoteOnly(false)
                        setCategory('')
                        setTopic('for-you')
                        setPage(1)
                        setShowBookmarks(false)
                      }}
                    >
                      Clear search
                    </button>
                  </>
                ) : null}
              </p>
            ) : (
              visible.map((job) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  selected={job.slug === selected?.slug && (isDesktop || mobilePreview)}
                  onSelect={(item) => {
                    setSelectedSlug(item.slug)
                    if (!isDesktop) setMobilePreview(true)
                  }}
                />
              ))
            )}
          </div>

          {!loading && visible.length > 0 && !showBookmarks ? (
            <div className="mt-3 flex w-full shrink-0 flex-col items-center px-2 pb-2 sm:mt-6 sm:px-4 sm:pb-6">
              <p className="text-center text-[13px] text-gray-500 sm:text-[14px]">
                You viewed {viewed} out of {totalCount} {keyword} jobs
              </p>
              <div className="mt-3 h-1.5 w-full max-w-[280px] overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${totalCount ? Math.max(6, (viewed / totalCount) * 100) : 0}%` }}
                />
              </div>
              {currentPage < totalPages ? (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mt-3 min-h-11 w-full max-w-xs rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:mt-5 sm:w-auto"
                >
                  {loadingMore ? 'Loading…' : 'Load more jobs'}
                </button>
              ) : null}
              <nav className="mt-3 flex w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-[13px] text-gray-500 sm:mt-5 sm:gap-3 sm:text-[14px]">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="min-h-9 px-1 disabled:opacity-40"
                >
                  <span className="sm:hidden">&lt; Prev</span>
                  <span className="hidden sm:inline">&lt; Previous</span>
                </button>
                {pageItems(currentPage, totalPages).map((item, index) =>
                  item === '…' ? (
                    <span key={`e-${index}`}>…</span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToPage(item)}
                      className={`min-h-9 min-w-9 rounded-full px-2 py-1 ${
                        item === currentPage ? 'bg-ink font-semibold text-white' : 'hover:text-ink'
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="min-h-9 px-1 disabled:opacity-40"
                >
                  Next &gt;
                </button>
              </nav>
            </div>
          ) : null}
        </section>

        <div className="sticky top-[86px] hidden lg:block">
          {!loading && <JobPreview job={selected} />}
        </div>
      </div>

      {mobilePreview && selected ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/45" aria-label="Close job preview" onClick={() => setMobilePreview(false)} />
          <div className="absolute inset-x-0 bottom-0 top-2 flex flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-12px_40px_rgba(16,35,28,0.18)] dark:bg-night-card">
            <div className="flex shrink-0 items-center justify-between px-2 py-1">
              <span className="ml-3 h-1 w-10 rounded-full bg-line dark:bg-night-line" />
              <button type="button" onClick={() => setMobilePreview(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none text-muted hover:bg-page" aria-label="Close job details">
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <JobPreview job={selected} variant="sheet" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
