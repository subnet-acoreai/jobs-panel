const SITE = 'https://cryptojobslist.com'
const DEFAULT_BUILD = process.env.CJL_NEXT_BUILD_ID || 'OL5siGC5aCOVJqUWUUDLV'
const CACHE_MS = 3 * 60 * 1000
const CATALOG_CACHE_MS = 5 * 60 * 1000
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const SKIP_TAGS = new Set([
  'web3',
  'jobs',
  'pay-in-crypto',
  'pay-in-fiat',
  'pay-in-bitcoin',
  'pay-in-stablecoins',
])

const cache = new Map()
const jobIndex = new Map()
let buildId = DEFAULT_BUILD
let buildAt = 0
let catalogPromise = null

function prettyTag(slug) {
  const special = {
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    'ui-ux': 'UI/UX',
    'c-plus-plus': 'C++',
    'lead-level': 'Lead Level',
    'entry-level': 'Entry Level',
    'human-resources': 'Human Resources',
    'smart-contract': 'Smart Contract',
    'product-manager': 'Product Manager',
    'project-manager': 'Project Manager',
    'data-analyst': 'Data Analyst',
    'customer-support': 'Customer Support',
  }
  if (special[slug]) return special[slug]
  return String(slug || '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatSalary(raw) {
  if (!raw || typeof raw !== 'object') return ''
    const unit =
    raw.unitText === 'HOUR' ? '/hour' : raw.unitText === 'MONTH' ? '/month' : raw.unitText === 'YEAR' ? '/year' : raw.unitText === 'WEEK' ? '/week' : ''
  const fmt = (n) => {
    const num = Number(n)
    if (!Number.isFinite(num)) return ''
    if (raw.unitText === 'HOUR' || raw.unitText === 'MONTH') return String(num)
    if (num >= 1000) return `${Math.round(num / 1000)}k`
    return String(num)
  }
  const min = fmt(raw.minValue)
  const max = fmt(raw.maxValue)
  if (min && max && min !== max) return `${min}-${max}${unit}`
  if (min) return `${min}${unit}`
  return ''
}

function salaryDisplay(job) {
  if (job.salaryString) return String(job.salaryString).replace(/^\$/, '')
  return formatSalary(job.salary)
}

function employmentType(tags = []) {
  if (tags.includes('part-time')) return 'Part Time'
  if (tags.includes('contract') || tags.includes('freelance')) return 'Contract'
  if (tags.includes('internship')) return 'Intern'
  return 'Full Time'
}

export function normalizeNextJob(raw, extras = {}) {
  const tags = (raw.tags || []).filter((tag) => !SKIP_TAGS.has(tag)).map(prettyTag)
  const salary = salaryDisplay(raw)
  const company = raw.companyName || raw.company?.name || 'Unknown'
  const slug = raw.seoSlug || extras.slug || ''
  const html = extras.html || raw.jobDescription || ''
  const job = {
    id: raw.id || slug,
    slug,
    title: raw.jobTitle || raw.title || '',
    company,
    companySlug: raw.company?.[0]?.slug || raw.company?.slug || company.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    salary,
    salaryMin: Number(raw.salary?.minValue || raw.estimatedSalary?.value?.minValue || 0),
    location: raw.jobLocation || (raw.remote ? 'Remote' : ''),
    remote: Boolean(raw.remote) || /remote/i.test(raw.jobLocation || ''),
    tags: tags.slice(0, 8),
    tagSlugs: raw.tags || [],
    category: raw.category || '',
    postedDaysAgo: null,
    postedAgo: raw.timeSinceJobCreation || '',
    featured: Boolean(raw.isFeatured),
    applicants: Number(raw.directApplicationsQty || 0),
    views: Number(raw.applicationLinkClicks || 0),
    type: employmentType(raw.tags || []),
    postedOn: raw.publishedAt ? new Date(raw.publishedAt).toLocaleDateString() : '',
    summary: '',
    html,
    logo: raw.companyLogo || raw.company?.logo || '',
    canonicalURL: slug ? `${SITE}/jobs/${slug}` : SITE,
    source: 'next',
    publishedAt: raw.publishedAt || '',
  }
  if (slug) jobIndex.set(slug, { ...jobIndex.get(slug), ...job })
  return job
}

async function parseMaybeJson(text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) throw new Error('Empty response')
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return JSON.parse(trimmed)
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence?.[1]) {
    const inner = fence[1].trim()
    if (inner.startsWith('{') || inner.startsWith('[')) return JSON.parse(inner)
  }
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1))
    } catch {
      // fall through
    }
  }
  throw new Error('Not JSON')
}

function unwrapPayload(payload) {
  if (payload?.props?.pageProps) return payload.props.pageProps
  if (payload?.pageProps) return payload.pageProps
  return payload
}

function extractNextData(html) {
  const idx = String(html || '').indexOf('__NEXT_DATA__')
  if (idx < 0) throw new Error('No NEXT_DATA')
  const start = html.indexOf('{', idx)
  const end = html.indexOf('</script>', start)
  if (start < 0 || end < 0) throw new Error('NEXT_DATA truncated')
  return JSON.parse(html.slice(start, end))
}

async function fetchDirect(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'x-nextjs-data': '1',
      'User-Agent': BROWSER_UA,
      Referer: `${SITE}/`,
    },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Next data ${res.status}`)
  if (text.trim().startsWith('<')) throw new Error('Next data HTML challenge')
  return JSON.parse(text)
}

async function fetchViaJina(url) {
  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Jina ${res.status}`)
  const payload = await res.json()
  const content = payload?.data?.content || payload?.content || ''
  return parseMaybeJson(content)
}

async function fetchViaTranslate(url) {
  const target = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(url)}`
  const res = await fetch(target, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': BROWSER_UA,
      Referer: 'https://translate.google.com/',
    },
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new Error(`Translate ${res.status}`)
  return extractNextData(await res.text())
}

function pageUrl(params = {}) {
  const tag = String(params.tag || params.category || params.topic || '').replace(/^\//, '')
  const location = slugify(params.location)
  const hasTag = Boolean(tag && !['for-you', 'web3', 'all'].includes(tag))
  const remote = Boolean(params.remote) && !hasTag
  const search = new URLSearchParams()
  const page = Math.max(1, Number(params.page || 1))
  if (page > 1) search.set('page', String(page))
  if (hasTag || remote || location) {
    const tagPart = remote ? 'remote' : hasTag ? tag : 'all'
    const locPart = location || 'all'
    const qs = search.toString()
    return `${SITE}/tags/${encodeURIComponent(tagPart)}/${encodeURIComponent(locPart)}${qs ? `?${qs}` : ''}`
  }
  const qs = search.toString()
  return `${SITE}/${qs ? `?${qs}` : ''}`
}

async function fetchNextPayload(params = {}) {
  const html = pageUrl(params)
  const cached = cache.get(html)
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.data
  const id = await resolveBuildId()
  const jsonUrl = `${SITE}/_next/data/${id}/${nextRoute({ ...params, query: '' })}`
  let data
  try {
    data = unwrapPayload(await fetchDirect(jsonUrl))
  } catch {
    try {
      data = unwrapPayload(await fetchViaJina(jsonUrl))
    } catch {
      data = unwrapPayload(await fetchViaTranslate(html))
    }
  }
  if (data?.notFound) throw new Error('Next page not found')
  cache.set(html, { at: Date.now(), data })
  return data
}

export async function resolveBuildId() {
  if (buildId && Date.now() - buildAt < 60 * 60 * 1000) return buildId
  try {
    const data = await fetchViaTranslate(SITE)
    if (data.buildId) {
      buildId = data.buildId
      buildAt = Date.now()
      return buildId
    }
  } catch {
    try {
      const html = await fetchViaJina(SITE)
      const blob = typeof html === 'string' ? html : JSON.stringify(html)
      const match = blob.match(/\/_next\/data\/([A-Za-z0-9_-]+)\//) || blob.match(/"buildId":"([^"]+)"/)
      if (match?.[1]) {
        buildId = match[1]
        buildAt = Date.now()
        return buildId
      }
    } catch {
      // keep previous
    }
  }
  buildAt = Date.now()
  return buildId
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function nextRoute(params = {}) {
  const tag = String(params.tag || params.category || params.topic || '').replace(/^\//, '')
  const location = slugify(params.location)
  const hasTag = Boolean(tag && !['for-you', 'web3', 'all'].includes(tag))
  const remote = Boolean(params.remote) && !hasTag
  if (hasTag || remote || location) {
    const tagPart = remote ? 'remote' : hasTag ? tag : 'all'
    const locPart = location || 'all'
    const search = new URLSearchParams()
    search.set('page', String(Math.max(1, Number(params.page || 1))))
    search.set('tag', tagPart)
    search.set('location', locPart)
    if (params.query) search.set('q', params.query)
    return `tags/${encodeURIComponent(tagPart)}/${encodeURIComponent(locPart)}.json?${search.toString()}`
  }
  const search = new URLSearchParams()
  search.set('page', String(Math.max(1, Number(params.page || 1))))
  if (params.query) search.set('q', params.query)
  if (params.location) search.set('location', params.location)
  return `index.json?${search.toString()}`
}

function payloadFromProps(props, page) {
  const jobs = (props.jobs || []).map((job) => normalizeNextJob(job))
  const meta = props.meta || {}
  const first = props.firstJob?.job
  if (first?.seoSlug) {
    const detailed = normalizeNextJob(first, { html: first.jobDescription, slug: first.seoSlug })
    const idx = jobs.findIndex((job) => job.slug === detailed.slug)
    if (idx >= 0) jobs[idx] = { ...jobs[idx], ...detailed }
  }
  return {
    jobs,
    companies: jobs.reduce((list, job) => {
      if (!list.some((item) => item.slug === job.companySlug)) {
        list.push({
          slug: job.companySlug,
          name: job.company,
          logo: job.logo,
          letter: job.company?.[0] || 'C',
          color: '#0D9F7A',
          location: job.remote ? 'Remote' : job.location,
          open: 1,
        })
      } else {
        const found = list.find((item) => item.slug === job.companySlug)
        found.open += 1
      }
      return list
    }, []),
    meta: {
      totalCount: meta.totalCount || jobs.length,
      page: meta.page || page,
      totalPages: meta.totalPages || 1,
      limit: meta.limit || 25,
      updatedAt: meta.updatedAt,
      keyword: props.page?.keyword || 'Crypto',
    },
    source: 'next',
    blogPosts: props.blogPosts || [],
  }
}

export async function listNextJobs(params = {}) {
  const page = Math.max(1, Number(params.page || 1))
  const props = await fetchNextPayload({ ...params, query: '' })
  return payloadFromProps(props, page)
}

async function mapPool(items, size, fn) {
  const out = []
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size)
    out.push(...(await Promise.all(batch.map(fn))))
  }
  return out
}

export async function listAllNextJobs(params = {}) {
  const key = `all:${params.tag || params.topic || ''}:${params.remote ? 1 : 0}:${params.location || ''}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.at < CATALOG_CACHE_MS) return cached.data
  if (catalogPromise && catalogPromise.key === key) return catalogPromise.run

  const run = (async () => {
    const first = await listNextJobs({ ...params, query: '', page: 1 })
    const totalPages = Math.min(24, Number(first.meta.totalPages || 1))
    const jobs = [...(first.jobs || [])]
    if (totalPages > 1) {
      const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
      const rest = await mapPool(pages, 4, async (page) => {
        try {
          return await listNextJobs({ ...params, query: '', page })
        } catch (error) {
          console.warn('[cjl] Next page', page, 'failed:', error.message)
          return { jobs: [] }
        }
      })
      for (const payload of rest) {
        for (const job of payload.jobs || []) {
          if (!jobs.some((item) => item.slug === job.slug)) jobs.push(job)
        }
      }
    }
    const data = {
      ...first,
      jobs,
      meta: {
        ...first.meta,
        totalCount: jobs.length,
        page: 1,
        totalPages: 1,
        limit: jobs.length,
      },
    }
    cache.set(key, { at: Date.now(), data })
    return data
  })()

  catalogPromise = { key, run }
  try {
    return await run
  } finally {
    if (catalogPromise?.key === key) catalogPromise = null
  }
}

export async function getNextJob(slug) {
  if (jobIndex.has(slug) && jobIndex.get(slug).html) return jobIndex.get(slug)
  try {
    const id = await resolveBuildId()
    const url = `${SITE}/_next/data/${id}/jobs/${encodeURIComponent(slug)}.json`
    let payload
    try {
      payload = unwrapPayload(await fetchDirect(url))
    } catch {
      try {
        payload = unwrapPayload(await fetchViaJina(url))
      } catch {
        payload = unwrapPayload(await fetchViaTranslate(`${SITE}/jobs/${encodeURIComponent(slug)}`))
      }
    }
    const raw = payload.firstJob?.job || payload.job
    if (!raw) return jobIndex.get(slug) || null
    return normalizeNextJob(raw, { html: raw.jobDescription, slug: raw.seoSlug || slug })
  } catch {
    return jobIndex.get(slug) || null
  }
}
