const ALIASES = {
  js: ['javascript'],
  ts: ['typescript'],
  py: ['python'],
  golang: ['go'],
  go: ['golang'],
  sol: ['solidity'],
  solidity: ['smart contract', 'smart-contract'],
  engineer: ['engineering', 'developer'],
  engineering: ['engineer', 'developer'],
  developer: ['engineer', 'engineering', 'dev'],
  dev: ['developer', 'engineer'],
  designer: ['design', 'ui', 'ux'],
  design: ['designer'],
  bd: ['business development'],
  hr: ['human resources', 'people'],
  ml: ['machine learning'],
  ai: ['artificial intelligence'],
  zk: ['zero knowledge', 'zkp'],
  nft: ['nfts'],
  defi: ['de-fi', 'decentralized finance'],
  intern: ['internship', 'internships'],
  internship: ['intern', 'internships'],
  junior: ['entry', 'entry-level', 'entry level'],
  'entry-level': ['junior', 'entry', 'intern'],
  us: ['united states', 'usa', 'america'],
  usa: ['united states', 'us'],
  uk: ['united kingdom', 'london', 'england'],
  nyc: ['new york', 'new york city'],
  sf: ['san francisco', 'bay area'],
}

const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'at', 'on', 'with'])

export function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/[\s,/|_-]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 1 && !STOP.has(part))
}

function expand(token) {
  return [token, ...(ALIASES[token] || [])]
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function haystack(job) {
  return [
    job.title,
    job.company,
    job.location,
    job.type,
    job.category,
    job.salary,
    job.summary,
    job.plain,
    ...(job.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function containsToken(hay, token) {
  if (!token) return false
  if (hay.includes(token)) return true
  if (token.length < 3) return false
  return new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(token)}`, 'i').test(hay)
}

function matchesTokens(hay, raw) {
  const tokens = tokenize(raw)
  if (!tokens.length) return true
  return tokens.every((token) => expand(token).some((alias) => containsToken(hay, alias)))
}

function matchesLocation(job, locationQuery) {
  const raw = String(locationQuery || '').trim()
  if (!raw) return true
  const tokens = tokenize(raw)
  const wantsRemote = tokens.includes('remote') || /remote/i.test(raw)
  const places = tokens.filter((token) => token !== 'remote')
  if (wantsRemote && !job.remote && !/remote/i.test(job.location || '')) return false
  if (!places.length) return true
  const loc = `${job.location || ''} ${job.remote ? 'remote' : ''}`.toLowerCase()
  return places.every((token) => expand(token).some((alias) => loc.includes(alias)))
}

function matchesTopic(job, topic) {
  if (!topic) return true
  const hay = haystack(job)
  const tokens = tokenize(topic)
  if (tokens.some((token) => (job.tags || []).some((tag) => tag.toLowerCase().includes(token)))) return true
  return tokens.every((token) => expand(token).some((alias) => containsToken(hay, alias)))
}

function matchesCategory(job, category) {
  if (!category) return true
  const slug = String(category).toLowerCase()
  if (job.category === slug) return true
  return (job.tags || []).some((tag) => tag.toLowerCase().replace(/\s+/g, '-') === slug || tag.toLowerCase().includes(slug))
}

export function scoreJob(job, query) {
  const tokens = tokenize(query)
  if (!tokens.length) return job.featured ? 4 : 0
  const title = (job.title || '').toLowerCase()
  const company = (job.company || '').toLowerCase()
  const tags = (job.tags || []).join(' ').toLowerCase()
  let score = 0
  for (const token of tokens) {
    const aliases = expand(token)
    if (aliases.some((alias) => title.includes(alias))) score += 12
    else if (aliases.some((alias) => company.includes(alias))) score += 8
    else if (aliases.some((alias) => tags.includes(alias))) score += 9
    else score += 2
  }
  if (job.featured) score += 4
  if (job.salaryMin) score += 1
  if (job.postedDaysAgo != null) score += Math.max(0, 6 - job.postedDaysAgo)
  return score
}

export function jobMatches(job, params = {}) {
  if (params.remote && !job.remote) return false
  if (!matchesCategory(job, params.category)) return false
  if (!matchesLocation(job, params.location)) return false
  if (!matchesTopic(job, params.topic)) return false
  return matchesTokens(haystack(job), params.query)
}

export function filterAndSortJobs(jobs, params = {}) {
  const matched = jobs.filter((job) => jobMatches(job, params))
  const sort = params.sort || 'recent'
  matched.sort((a, b) => {
    if (sort === 'salary') return (b.salaryMin || 0) - (a.salaryMin || 0)
    if (sort === 'relevant') {
      const diff = scoreJob(b, params.query) - scoreJob(a, params.query)
      if (diff) return diff
    }
    const ad = a.postedDaysAgo
    const bd = b.postedDaysAgo
    if (ad == null && bd == null) return 0
    if (ad == null) return 1
    if (bd == null) return -1
    return ad - bd
  })
  return matched
}
