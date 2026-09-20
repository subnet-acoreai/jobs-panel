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
    if (!visible.length) {
      setSelectedSlug(null)
      return
    }
    if (!visible.some((job) => job.slug === selectedSlug)) {
      setSelectedSlug(visible[0].slug)
    }
  }, [visible, selectedSlug])

  const selected = visible.find((job) => job.slug === selectedSlug) || visible[0]

  useEffect(() => {
    if (!selected?.slug || selected.html) return
    getJob(selected.slug).catch(() => {})
  }, [selected?.slug, selected?.html, getJob])

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
  const limit = meta.limit || 25
  const currentPage = meta.page || page
  const totalPages = meta.totalPages || 1
  const viewed = Math.min(Math.max(visible.length, currentPage * limit), totalCount || visible.length)
  const keyword = meta.keyword || 'Crypto'

  return (
    <div className="mx-auto max-w-[1360px] bg-[radial-gradient(circle,_#d5deee_1px,_transparent_1px)] bg-[size:18px_18px] px-5 pb-10 pt-4">
      <h1 className="text-[28px] font-extrabold tracking-tight sm:text-[32px]">
        The Biggest List of Crypto, Blockchain and Web3 Jobs
      </h1>

      <LogoTicker companies={companies} />

      <div className="mt-1">
        <TopicBar active={topic} onSelect={onTopic} />
      </div>

      <div className="mt-4">
        <SearchBar />
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(320px,440px)_1fr]">
        <section>
          <div className="mb-1 flex items-center justify-end gap-3 text-[13px] text-gray-400">
            <button
              type="button"
              onClick={() => setShowBookmarks((v) => !v)}
              className={`inline-flex items-center gap-1 ${showBookmarks ? 'text-brand' : 'hover:text-ink'}`}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={showBookmarks ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M6 4h12v16l-6-3-6 3V4z" />
              </svg>
              Bookmarks
            </button>
          </div>
          <div className="space-y-0.5 pr-1">
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
                  selected={job.slug === selected?.slug}
                  onSelect={(item) => setSelectedSlug(item.slug)}
                />
              ))
            )}
          </div>

          {!loading && visible.length > 0 && !showBookmarks ? (
            <div className="mt-6 flex flex-col items-center px-4 pb-6">
              <p className="text-[14px] text-gray-500">
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
                  className="mt-5 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {loadingMore ? 'Loading…' : 'Load more jobs'}
                </button>
              ) : null}
              <nav className="mt-5 flex items-center gap-3 text-[14px] text-gray-500">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="disabled:opacity-40"
                >
                  &lt; Previous
                </button>
                {pageItems(currentPage, totalPages).map((item, index) =>
                  item === '…' ? (
                    <span key={`e-${index}`}>…</span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToPage(item)}
                      className={`min-w-8 rounded-md px-2 py-1 ${
                        item === currentPage ? 'border border-gray-200 bg-white font-semibold text-ink' : 'hover:text-ink'
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
                  className="disabled:opacity-40"
                >
                  Next &gt;
                </button>
              </nav>
            </div>
          ) : null}
        </section>

        <div className="sticky top-[70px] hidden lg:block">
          {!loading && <JobPreview job={selected} />}
        </div>
      </div>

      <div className="mt-5 lg:hidden">{selected && !loading ? <JobPreview job={selected} /> : null}</div>
    </div>
  )
}
