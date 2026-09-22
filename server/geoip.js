const cache = new Map()
const CACHE_MS = 12 * 60 * 60 * 1000

function isPrivateIp(ip) {
  const value = String(ip || '')
  if (!value || value === '127.0.0.1' || value === '::1') return true
  if (value.startsWith('10.') || value.startsWith('192.168.') || value.startsWith('169.254.')) return true
  const parts = value.split('.').map(Number)
  if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  if (value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe80')) return true
  return false
}

function clip(value, max) {
  return String(value || '').trim().slice(0, max)
}

function empty(ip, extra = {}) {
  return { ip: clip(ip, 64), city: '', region: '', country: '', countryCode: '', isp: '', label: extra.label || '', ...extra }
}

export function formatGeo(geo) {
  if (!geo) return ''
  if (geo.label && !geo.city && !geo.country) return geo.label
  return [geo.city, geo.region, geo.country].filter(Boolean).join(', ')
}

async function lookupIpwho(ip) {
  const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(4000),
  })
  if (!res.ok) throw new Error(`ipwho ${res.status}`)
  const data = await res.json()
  if (data?.success === false) throw new Error(data.message || 'ipwho failed')
  return {
    ip,
    city: clip(data.city, 80),
    region: clip(data.region || data.region_code, 80),
    country: clip(data.country, 80),
    countryCode: clip(data.country_code, 8),
    isp: clip(data.connection?.isp || data.isp, 80),
    label: '',
  }
}

async function lookupIpApi(ip) {
  const res = await fetch(
    `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,regionName,city,isp`,
    { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) },
  )
  if (!res.ok) throw new Error(`ip-api ${res.status}`)
  const data = await res.json()
  if (data.status !== 'success') throw new Error(data.message || 'ip-api failed')
  return {
    ip,
    city: clip(data.city, 80),
    region: clip(data.regionName, 80),
    country: clip(data.country, 80),
    countryCode: clip(data.countryCode, 8),
    isp: clip(data.isp, 80),
    label: '',
  }
}

export async function lookupIp(ip) {
  const key = clip(ip, 64)
  if (!key) return empty('')
  if (isPrivateIp(key)) return empty(key, { label: 'local network' })

  const cached = cache.get(key)
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.geo

  let geo
  try {
    geo = await lookupIpwho(key)
  } catch {
    try {
      geo = await lookupIpApi(key)
    } catch {
      geo = empty(key)
    }
  }
  geo.label = formatGeo(geo)
  cache.set(key, { at: Date.now(), geo })
  if (cache.size > 2000) {
    const first = cache.keys().next().value
    cache.delete(first)
  }
  return geo
}
