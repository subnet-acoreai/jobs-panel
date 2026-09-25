import { useEffect, useRef, useState } from 'react'

const SCRIPT = 'https://assets.calendly.com/assets/external/widget.js'
const STYLES = 'https://assets.calendly.com/assets/external/widget.css'

function isCalendly(url) {
  try {
    const host = new URL(url).hostname
    return host === 'calendly.com' || host.endsWith('.calendly.com')
  } catch {
    return false
  }
}

function embedUrl(url, dark) {
  const parsed = new URL(url)
  parsed.searchParams.set('hide_gdpr_banner', '1')
  parsed.searchParams.set('primary_color', '0084ff')
  if (dark) {
    parsed.searchParams.set('background_color', '0b1730')
    parsed.searchParams.set('text_color', 'e8f1fb')
  } else {
    parsed.searchParams.set('background_color', 'ffffff')
    parsed.searchParams.set('text_color', '061b36')
  }
  return parsed.toString()
}

function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.Calendly) {
      resolve(window.Calendly)
      return
    }
    const existing = document.querySelector(`script[src="${SCRIPT}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Calendly), { once: true })
      existing.addEventListener('error', () => reject(new Error('Could not load Calendly')), { once: true })
      return
    }
    if (!document.querySelector(`link[href="${STYLES}"]`)) {
      const css = document.createElement('link')
      css.rel = 'stylesheet'
      css.href = STYLES
      document.head.appendChild(css)
    }
    const script = document.createElement('script')
    script.src = SCRIPT
    script.async = true
    script.onload = () => resolve(window.Calendly)
    script.onerror = () => reject(new Error('Could not load Calendly'))
    document.head.appendChild(script)
  })
}

export default function CalendlyEmbed({ url, prefill = {} }) {
  const host = useRef(null)
  const [booked, setBooked] = useState(false)
  const [error, setError] = useState('')
  const dark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  useEffect(() => {
    if (!url || !isCalendly(url)) return undefined
    let cancelled = false
    const node = host.current
    if (node) node.innerHTML = ''

    loadScript()
      .then((Calendly) => {
        if (cancelled || !Calendly || !host.current) return
        Calendly.initInlineWidget({
          url: embedUrl(url, dark),
          parentElement: host.current,
          prefill: {
            name: prefill.name || [prefill.firstName, prefill.lastName].filter(Boolean).join(' '),
            firstName: prefill.firstName || '',
            lastName: prefill.lastName || '',
            email: prefill.email || '',
          },
          resize: true,
        })
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    function onMessage(event) {
      const payload = event.data
      if (payload?.event === 'calendly.event_scheduled') setBooked(true)
    }
    window.addEventListener('message', onMessage)
    return () => {
      cancelled = true
      window.removeEventListener('message', onMessage)
      if (node) node.innerHTML = ''
    }
  }, [url, dark, prefill.name, prefill.firstName, prefill.lastName, prefill.email])

  if (!url) return null

  if (!isCalendly(url)) {
    return (
      <iframe
        title="Schedule a meeting"
        src={url}
        className="mt-5 h-[720px] w-full min-w-[320px] rounded-2xl border-0 bg-white"
      />
    )
  }

  return (
    <div className="mt-5">
      {booked ? (
        <p className="mb-3 rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand">
          Meeting booked. You should get a calendar invite from Calendly.
        </p>
      ) : null}
      {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
      <div
        ref={host}
        className="w-full min-w-[320px] overflow-hidden rounded-2xl bg-white dark:bg-night-card"
        style={{ minWidth: 320, minHeight: 720 }}
      />
      <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-muted hover:text-brand">
        Open Calendly in a new tab
      </a>
    </div>
  )
}
