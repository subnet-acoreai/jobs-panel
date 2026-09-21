function clip(value, max) {
  return String(value || '').trim().slice(0, max)
}

export function normalizeIp(value) {
  let ip = clip(value, 64)
  if (ip.startsWith('::ffff:')) ip = ip.slice(7)
  if (ip === '::1') ip = '127.0.0.1'
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip) || /^[a-f0-9:]+$/i.test(ip)) return ip
  return ''
}

export function clientIp(req) {
  const forwarded = String(req?.headers?.['x-forwarded-for'] || '')
    .split(',')
    .map((part) => normalizeIp(part))
    .find(Boolean)
  return forwarded || normalizeIp(req?.ip) || normalizeIp(req?.socket?.remoteAddress)
}

function windowsLabel(version) {
  const major = Number(String(version || '').split('.')[0])
  if (Number.isFinite(major) && major >= 13) return 'Windows 11'
  if (Number.isFinite(major) && major >= 10) return 'Windows 10'
  return 'Windows'
}

export function osFromHints(hints = {}, userAgent = '') {
  const ua = String(userAgent || hints.userAgent || '')
  const platform = clip(hints.uaPlatform || hints.platform, 80)
  const version = clip(hints.platformVersion, 32)
  const arch = [clip(hints.architecture, 16), clip(hints.bitness, 8)].filter(Boolean).join('/')

  let os = ''
  if (/win/i.test(platform) || /windows/i.test(ua)) os = windowsLabel(version)
  else if (/mac/i.test(platform) || /mac os x/i.test(ua)) os = version ? `macOS ${version}` : 'macOS'
  else if (/android/i.test(platform) || /android/i.test(ua)) os = version ? `Android ${version}` : 'Android'
  else if (/ios|iphone|ipad/i.test(platform) || /iphone|ipad|ipod/i.test(ua)) os = version ? `iOS ${version}` : 'iOS'
  else if (/cros|chrome os/i.test(platform) || /cros/i.test(ua)) os = 'Chrome OS'
  else if (/linux/i.test(platform) || /linux/i.test(ua)) os = 'Linux'
  else os = platform || 'Unknown'

  if (hints.mobile && !/android|ios/i.test(os)) os = `${os} (mobile)`
  if (arch && os !== 'Unknown') os = `${os} · ${arch}`
  return os.slice(0, 80)
}

export function sanitizeClientMeta(raw, req) {
  let parsed = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = {}
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) parsed = {}

  const userAgent = clip(parsed.userAgent || req?.headers?.['user-agent'], 512)
  const platform = clip(parsed.uaPlatform || parsed.platform, 80)
  return {
    ip: clientIp(req),
    os: osFromHints(parsed, userAgent) || osFromHints({}, userAgent),
    platform,
    userAgent,
  }
}
