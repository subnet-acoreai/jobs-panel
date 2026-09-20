import { useEffect, useState } from 'react'

export function useApi(path) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    setLoading(true)
    fetch(path)
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(payload.message || `Request failed (${res.status})`)
        if (live) setData(payload)
      })
      .catch((err) => {
        if (live) setError(err.message)
      })
      .finally(() => {
        if (live) setLoading(false)
      })
    return () => {
      live = false
    }
  }, [path])

  return { data, loading, error }
}

export function usd(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `$${Math.round(Number(value)).toLocaleString('en-US')}`
}
