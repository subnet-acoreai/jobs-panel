import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { cleanJobHtml } from '../shared/cleanHtml.js'
import { requireAdmin } from './auth.js'

const FILE = path.join(process.cwd(), 'data', 'extra-jobs.json')

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function htmlToText(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function textToHtml(text) {
  const escaped = String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  if (!escaped.trim()) return ''
  return escaped
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br />')}</p>`)
    .join('')
}

function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ''))
}

function descriptionToHtml(description) {
  const raw = String(description || '').trim()
  if (!raw) return ''
  if (looksLikeHtml(raw)) return cleanJobHtml(raw)
  return textToHtml(raw)
}

function salaryLabel(job) {
  if (job.hideSalary) return ''
  const min = String(job.salaryMin || '').trim()
  const max = String(job.salaryMax || '').trim()
  if (!min && !max) return ''
  const period = job.period ? ` / ${String(job.period).toLowerCase()}` : ''
  if (min && max) return `$${min} – $${max}${period}`
  return `$${min || max}${period}`
}

function salaryMinNum(job) {
  const match = String(job.salaryMin || job.salaryMax || '').replace(/,/g, '').match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

function normalizeCalendly(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  let parsed
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error('Enter a valid Calendly URL')
  }
  if (parsed.protocol !== 'https:') throw new Error('Calendly link must start with https://')
  return parsed.toString()
}

function daysAgo(dateValue) {
  if (!dateValue) return null
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 86400000))
}

function parsePostedAt(value, fallback = '') {
  const raw = String(value ?? '').trim() || String(fallback || '').trim()
  if (!raw) return ''
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

function parseApplicants(value, fallback = 0) {
  const n = Number(value ?? fallback)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(999999, Math.round(n))
}

function uniqueSlug(base, existing, ignoreId = '') {
  const root = `extra-${slugify(base) || 'job'}`
  const taken = new Set(
    existing.filter((job) => job.id !== ignoreId).map((job) => job.slug),
  )
  if (!taken.has(root)) return root
  let n = 2
  while (taken.has(`${root}-${n}`)) n += 1
  return `${root}-${n}`
}

function readJobs() {
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeJobs(jobs) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(jobs, null, 2))
}

function shapeInput(body, existing = {}, all = []) {
  const title = String(body.title ?? existing.title ?? '').trim()
  const company = String(body.company ?? existing.company ?? '').trim()
  if (!title) throw new Error('Job title is required')
  if (!company) throw new Error('Company name is required')
  const description = looksLikeHtml(body.description ?? existing.description ?? '')
    ? cleanJobHtml(body.description ?? existing.description ?? '')
    : String(body.description ?? existing.description ?? '')
  const location = String(body.location ?? existing.location ?? '').trim()
  const remote = Boolean(body.remote ?? existing.remote ?? (!location || /remote/i.test(location)))
  const resolvedStatus = body.status === 'published' ? 'published' : body.status === 'draft' ? 'draft' : existing.status || 'draft'
  const tags = Array.isArray(body.tags)
    ? body.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : String(body.tags ?? (existing.tags || []).join(', '))
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
  return {
    title,
    company,
    companySlug: slugify(company) || 'company',
    description,
    location: location || (remote ? 'Remote' : ''),
    remote,
    salaryMin: String(body.salaryMin ?? existing.salaryMin ?? '').trim(),
    salaryMax: String(body.salaryMax ?? existing.salaryMax ?? '').trim(),
    currency: String(body.currency ?? existing.currency ?? 'USD').trim() || 'USD',
    period: String(body.period ?? existing.period ?? 'Year').trim() || 'Year',
    hideSalary: Boolean(body.hideSalary ?? existing.hideSalary),
    type: String(body.type ?? existing.type ?? 'Full Time').trim() || 'Full Time',
    tags,
    calendlyUrl: normalizeCalendly(body.calendlyUrl ?? existing.calendlyUrl ?? ''),
    email: String(body.email ?? existing.email ?? '').trim(),
    status: resolvedStatus,
    slug: uniqueSlug(`${title}-at-${company}`, all, existing.id),
    applicants: parseApplicants(body.applicants, existing.applicants),
    publishedAt: parsePostedAt(body.publishedAt ?? body.postedAt, existing.publishedAt),
  }
}

export function extraJobToPublic(job) {
  const html = descriptionToHtml(job.description)
  const salary = salaryLabel(job)
  const posted = job.publishedAt || job.createdAt
  const postedDate = posted ? new Date(posted) : null
  return {
    id: job.slug,
    extraId: job.id,
    slug: job.slug,
    title: job.title,
    company: job.company,
    companySlug: job.companySlug,
    salary,
    salaryMin: salaryMinNum(job),
    location: job.location,
    remote: Boolean(job.remote),
    tags: job.tags || [],
    category: '',
    postedDaysAgo: daysAgo(posted),
    featured: true,
    applicants: parseApplicants(job.applicants, 0),
    views: 0,
    type: job.type || 'Full Time',
    postedOn:
      postedDate && !Number.isNaN(postedDate.getTime())
        ? postedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '',
    publishedAt: posted || '',
    summary: htmlToText(html).slice(0, 280),
    plain: htmlToText(html).slice(0, 2500),
    html,
    logo: job.logo || '',
    canonicalURL: `/jobs/${job.slug}`,
    source: 'extra',
    calendlyUrl: job.calendlyUrl || '',
  }
}

export function listExtraJobs() {
  return readJobs().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
}

export function listPublishedExtraJobs() {
  return listExtraJobs().filter((job) => job.status === 'published').map(extraJobToPublic)
}

export function getExtraJob(id) {
  return readJobs().find((job) => job.id === id) || null
}

export function getPublishedExtraBySlug(slug) {
  const job = readJobs().find((item) => item.slug === slug && item.status === 'published')
  return job ? extraJobToPublic(job) : null
}

export function getExtraCalendly(slug) {
  return getPublishedExtraBySlug(slug)?.calendlyUrl || ''
}

function fromLiveJob(live) {
  return {
    title: live.title || '',
    company: live.company || '',
    description: cleanJobHtml(live.html || live.plain || live.summary || ''),
    location: live.location || '',
    remote: Boolean(live.remote),
    salaryMin: String(live.salary || '').replace(/^\$/, '').split(/[-–]/)[0]?.trim() || '',
    salaryMax: String(live.salary || '').replace(/^\$/, '').split(/[-–]/)[1]?.trim() || '',
    currency: 'USD',
    period: 'Year',
    hideSalary: !live.salary,
    type: live.type || 'Full Time',
    tags: live.tags || [],
    calendlyUrl: live.calendlyUrl || '',
    email: '',
    logo: live.logo || '',
    applicants: Number(live.applicants || 0),
    publishedAt: live.publishedAt || '',
  }
}

export const extraJobsRouter = Router()
extraJobsRouter.use(requireAdmin)

extraJobsRouter.get('/', (_req, res) => {
  res.json({ jobs: listExtraJobs() })
})

extraJobsRouter.post('/copy', async (req, res) => {
  try {
    const fromId = String(req.body?.fromId || '').trim()
    const fromSlug = String(req.body?.fromSlug || '').trim()
    const all = readJobs()
    let source = fromId ? all.find((job) => job.id === fromId) : all.find((job) => job.slug === fromSlug)
    let live = null
    if (!source && fromSlug) {
      const { getJob } = await import('./cjlApi.js')
      live = await getJob(fromSlug)
      if (!live) return res.status(404).json({ message: 'Job not found' })
      source = fromLiveJob(live)
    }
    if (!source) return res.status(404).json({ message: 'Job not found' })

    const now = new Date().toISOString()
    const copy = {
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      copiedFrom: source.id || fromSlug || live?.slug || '',
      ...shapeInput(
        {
          ...source,
          title: source.title?.startsWith('Copy of ') ? source.title : `Copy of ${source.title}`,
          status: 'published',
        },
        {},
        all,
      ),
      logo: source.logo || live?.logo || '',
    }
    if (!copy.publishedAt && copy.status === 'published') copy.publishedAt = now
    all.push(copy)
    writeJobs(all)
    res.status(201).json({ job: copy })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Could not copy job' })
  }
})

extraJobsRouter.post('/', (req, res) => {
  try {
    const all = readJobs()
    const now = new Date().toISOString()
    const job = {
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...shapeInput(req.body || {}, {}, all),
    }
    if (!job.publishedAt && job.status === 'published') job.publishedAt = now
    all.push(job)
    writeJobs(all)
    res.status(201).json({ job })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Could not create job' })
  }
})

extraJobsRouter.get('/:id', (req, res) => {
  const job = getExtraJob(req.params.id)
  if (!job) return res.status(404).json({ message: 'Job not found' })
  res.json({ job })
})

extraJobsRouter.put('/:id', (req, res) => {
  try {
    const all = readJobs()
    const index = all.findIndex((job) => job.id === req.params.id)
    if (index < 0) return res.status(404).json({ message: 'Job not found' })
    const existing = all[index]
    const next = {
      ...existing,
      ...shapeInput(req.body || {}, existing, all),
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      copiedFrom: existing.copiedFrom || '',
    }
    if (!next.publishedAt && next.status === 'published') next.publishedAt = next.updatedAt
    next.slug = existing.slug || next.slug
    all[index] = next
    writeJobs(all)
    res.json({ job: next })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Could not update job' })
  }
})

extraJobsRouter.delete('/:id', (req, res) => {
  const all = readJobs()
  const next = all.filter((job) => job.id !== req.params.id)
  if (next.length === all.length) return res.status(404).json({ message: 'Job not found' })
  writeJobs(next)
  res.json({ ok: true })
})
