import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { detectWallets } from '../lib/detectWallets'

export default function VisitTracker() {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    const search = location.search

    ;(async () => {
      let wallets = { wallets: [], chains: [], detected: false }
      try {
        wallets = await detectWallets()
      } catch {
        wallets = { wallets: [], chains: [], detected: false }
      }

      const body = JSON.stringify({
        path,
        search,
        title: document.title,
        referrer: document.referrer,
        wallets,
        client: {
          userAgent: navigator.userAgent || '',
          platform: navigator.platform || '',
          uaPlatform: navigator.userAgentData?.platform || '',
          mobile: Boolean(navigator.userAgentData?.mobile),
        },
      })

      await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body,
      }).catch(() => {})
    })()
  }, [location.pathname, location.search])

  return null
}
