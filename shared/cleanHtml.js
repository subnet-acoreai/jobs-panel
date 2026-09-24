export function cleanJobHtml(html, { keepEmpty = false } = {}) {
  let out = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')

  out = out.replace(/<([a-z0-9]+)([^>]*)>/gi, (_, tag, attrs) => {
    const name = String(tag).toLowerCase()
    if (name === 'a') {
      const href = attrs.match(/\shref\s*=\s*("([^"]*)"|'([^']*)')/i)
      const url = href?.[2] || href?.[3] || ''
      if (url && !/^\s*javascript:/i.test(url)) return `<a href="${url.replace(/"/g, '&quot;')}">`
      return '<a>'
    }
    if (name === 'img') {
      const src = attrs.match(/\ssrc\s*=\s*("([^"]*)"|'([^']*)')/i)
      const alt = attrs.match(/\salt\s*=\s*("([^"]*)"|'([^']*)')/i)
      const srcVal = src?.[2] || src?.[3] || ''
      const altVal = alt?.[2] || alt?.[3] || ''
      return srcVal ? `<img src="${srcVal.replace(/"/g, '&quot;')}" alt="${altVal.replace(/"/g, '&quot;')}">` : ''
    }
    return `<${name}>`
  })

  out = out.replace(/<\/?span\b[^>]*>/gi, '').replace(/<\/?font\b[^>]*>/gi, '')
  return keepEmpty ? out.trim() : stripEmptyBlocks(out)
}

export function stripEmptyBlocks(html) {
  let out = String(html || '')
  for (let i = 0; i < 8; i += 1) {
    const next = out
      .replace(/<p>(\s|<br\s*\/?>|&nbsp;|&#160;)*<\/p>/gi, '')
      .replace(/<div>(\s|<br\s*\/?>|&nbsp;|&#160;)*<\/div>/gi, '')
      .replace(/<h[1-6]>(\s|<br\s*\/?>|&nbsp;|&#160;)*<\/h[1-6]>/gi, '')
      .replace(/<li>(\s|<br\s*\/?>|&nbsp;|&#160;|<p>\s*<\/p>)*<\/li>/gi, '')
      .replace(/<(ul|ol)>(\s)*<\/\1>/gi, '')
    if (next === out) break
    out = next
  }
  return out.trim()
}
