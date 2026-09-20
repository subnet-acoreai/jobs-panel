import { listJobs } from './cjlApi.js'
import { salaryBands, salaryHeadline } from './cjlPublic.js'

const ROLE_KEYS = [
  ['Solidity', ['solidity', 'smart contract']],
  ['Developer', ['engineer', 'developer', 'engineering', 'frontend', 'backend', 'fullstack']],
  ['Design', ['design', 'designer', 'ui', 'ux']],
  ['Product', ['product manager', 'product owner', 'cpo']],
  ['Marketing', ['marketing', 'growth', 'brand', 'content']],
  ['Community', ['community', 'ambassador']],
  ['Sales', ['sales', 'business development', 'partnership']],
  ['Legal', ['legal', 'compliance', 'counsel']],
  ['Finance', ['finance', 'accountant', 'cfo', 'treasury']],
]

export function classifyRole(job) {
  const hay = `${job.title} ${(job.tags || []).join(' ')} ${job.category}`.toLowerCase()
  for (const [role, keys] of ROLE_KEYS) {
    if (keys.some((key) => hay.includes(key))) return role
  }
  return 'Other'
}

export function toAnnual(job) {
  const raw = String(job.salary || '')
  if (!raw) return 0
  const match = raw.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(k)?/i)
  if (!match) return 0
  let value = Number(match[1])
  if (match[2] || /k\b/i.test(raw)) value *= 1000
  if (/hour|\/\s*hr/i.test(raw)) return Math.round(value * 2080)
  if (/month|\/\s*mo/i.test(raw)) return Math.round(value * 12)
  if (value < 1000) value *= 1000
  return Math.round(value)
}

function percentile(sorted, p) {
  if (!sorted.length) return 0
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))))
  return sorted[index]
}

function statsFor(values) {
  const sorted = [...values].filter((n) => n > 0).sort((a, b) => a - b)
  if (!sorted.length) return null
  const mean = Math.round(sorted.reduce((sum, n) => sum + n, 0) / sorted.length)
  return { mean, p10: percentile(sorted, 10), p90: percentile(sorted, 90), count: sorted.length }
}

export async function getSalaryReport() {
  const { jobs, meta } = await listJobs()
  const paid = jobs.map((job) => ({ job, annual: toAnnual(job) })).filter((row) => row.annual >= 15000 && row.annual <= 500000)
  const live = statsFor(paid.map((row) => row.annual))
  const byRole = salaryBands.map((band) => {
    const samples = paid.filter((row) => classifyRole(row.job) === band.role).map((row) => row.annual)
    return { ...band, live: statsFor(samples) }
  })
  return {
    headline: salaryHeadline,
    live: live
      ? { ...live, listings: paid.length, catalog: meta?.catalogSize || jobs.length, source: 'rss' }
      : { mean: 0, p10: 0, p90: 0, listings: 0, catalog: jobs.length, source: 'rss' },
    roles: byRole,
    source: salaryHeadline.source,
  }
}

export function estimateSalary({ role = 'Developer', experience = 3, location = '', remote = true }) {
  const band = salaryBands.find((item) => item.role.toLowerCase() === String(role).toLowerCase()) || salaryBands.find((item) => item.role === 'Developer')
  const exp = Number(experience) || 0
  const expMult = exp < 2 ? 0.72 : exp < 5 ? 1 : exp < 8 ? 1.22 : 1.45
  const loc = `${location} ${remote ? 'remote' : ''}`.toLowerCase()
  let locMult = 1
  if (/india|philippines|nigeria|pakistan|vietnam|indonesia/.test(loc)) locMult = 0.55
  else if (/united states|usa|\bus\b|new york|san francisco|nyc/.test(loc)) locMult = 1.18
  else if (/london|uk|united kingdom|germany|singapore/.test(loc)) locMult = 1.08
  else if (remote) locMult = 1
  const mean = Math.round(band.mean * expMult * locMult)
  return {
    role: band.role,
    experience: exp,
    location: location || (remote ? 'Remote' : ''),
    remote: Boolean(remote),
    mean,
    p10: Math.round(band.p10 * expMult * locMult),
    p90: Math.round(band.p90 * expMult * locMult),
    source: salaryHeadline.source,
  }
}

export async function getHiringTrends() {
  const { jobs, companies, meta } = await listJobs()
  const titles = new Map()
  const skills = new Map()
  const locations = new Map()
  for (const job of jobs) {
    titles.set(job.title, (titles.get(job.title) || 0) + 1)
    locations.set(job.remote ? 'Remote' : job.location || 'Unknown', (locations.get(job.remote ? 'Remote' : job.location || 'Unknown') || 0) + 1)
    for (const tag of job.tags || []) skills.set(tag, (skills.get(tag) || 0) + 1)
  }
  const top = (map, n) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count }))
  return {
    totalJobs: jobs.length,
    catalog: meta?.catalogSize || jobs.length,
    companies: companies.length,
    remoteShare: jobs.length ? Math.round((jobs.filter((job) => job.remote).length / jobs.length) * 100) : 0,
    titles: top(titles, 8),
    skills: top(skills, 12),
    locations: top(locations, 8),
    companiesHiring: companies.slice(0, 12).map((c) => ({ name: c.name, open: c.open, logo: c.logo, slug: c.slug })),
  }
}
