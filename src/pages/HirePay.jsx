import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { CHAINS, LISTING_PRICE, clearHireDraft, readHireDraft } from '../lib/hire'

export default function HirePay() {
  const { user } = useApp()
  const navigate = useNavigate()
  const draft = useMemo(() => readHireDraft(), [])
  const [chainId, setChainId] = useState('solana')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const [error, setError] = useState('')
  const chain = CHAINS.find((item) => item.id === chainId) || CHAINS[0]

  if (!draft) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">No listing to pay for</h1>
        <p className="mt-2 text-sm text-gray-500">Fill in the hire form first, then post your job.</p>
        <Link to="/hire" className="mt-6 inline-block text-sm font-semibold text-brand">
          Back to hire form
        </Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">Sign in to pay</h1>
        <p className="mt-2 text-sm text-gray-500">Use your email to create an account or sign in, then complete crypto payment.</p>
        <Link to="/login" state={{ from: '/hire/pay' }} className="mt-6 inline-block rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white">
          Continue with email
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-sm font-semibold text-brand">Payment marked</p>
        <h1 className="mt-2 text-3xl font-extrabold">Listing submitted</h1>
        <p className="mt-3 text-sm text-gray-500">
          {draft.title} at {draft.company} is queued for review after your {chain.name} transfer. You will get an email at {user.email}.
        </p>
        <Link to="/" className="mt-8 inline-block rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white">
          Back to jobs
        </Link>
      </div>
    )
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(chain.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  async function confirmPaid() {
    setBusy(true)
    setError('')
    try {
      const created = await fetch('/api/listings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: draft,
          chain: chain.id,
          amountUsd: LISTING_PRICE,
        }),
      })
      const payload = await created.json().catch(() => ({}))
      if (!created.ok) throw new Error(payload.message || 'Could not create listing')
      const paid = await fetch(`/api/listings/${payload.listing.id}/paid`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain: chain.id }),
      })
      const paidPayload = await paid.json().catch(() => ({}))
      if (!paid.ok) throw new Error(paidPayload.message || 'Could not confirm payment')
      clearHireDraft()
      setDone(paidPayload.listing)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
      <button type="button" onClick={() => navigate('/hire')} className="text-sm text-gray-500 hover:text-ink">
        ← Edit listing
      </button>
      <h1 className="mt-3 text-[26px] font-extrabold tracking-tight sm:text-3xl">Pay with crypto</h1>
      <p className="mt-2 text-sm text-gray-500">
        {draft.title} at {draft.company} · ${LISTING_PRICE} USD for a 30-day listing. Choose a chain, send the amount, then confirm.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {CHAINS.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setChainId(item.id)}
            className={`rounded-2xl border p-4 text-left ${
              chainId === item.id ? 'border-brand bg-brand-soft dark:bg-brand/15' : 'border-gray-200 dark:border-night-line'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: item.color }}>
                {item.token.slice(0, 1)}
              </span>
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-gray-500">{item.amount}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-gray-200 p-5 dark:border-night-line">
        <p className="text-sm font-semibold">Send {chain.amount} on {chain.name}</p>
        <p className="mt-1 text-[13px] text-gray-500">{chain.note} Amount due ${LISTING_PRICE} USD.</p>
        <div
          className="mx-auto mt-5 h-36 w-36 rounded-xl border border-gray-200"
          style={{
            backgroundImage: `linear-gradient(90deg, ${chain.color}22 1px, transparent 1px), linear-gradient(${chain.color}22 1px, transparent 1px)`,
            backgroundSize: '12px 12px',
          }}
          aria-hidden="true"
        />
        <p className="mt-4 break-all rounded-lg bg-gray-50 px-3 py-3 font-mono text-[12px] sm:text-[13px] dark:bg-white/5">{chain.address}</p>
        <button type="button" onClick={copyAddress} className="mt-3 text-sm font-semibold text-brand">
          {copied ? 'Copied' : 'Copy address'}
        </button>
      </section>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      <button
        type="button"
        disabled={busy}
        onClick={confirmPaid}
        className="mt-6 min-h-11 w-full rounded-full bg-brand py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? 'Saving…' : `I've paid with ${chain.name}`}
      </button>
      <p className="mt-3 text-center text-[12px] text-gray-400">
        Confirmation is recorded for review. Do not send funds until you verify the address in your own wallet.
      </p>
    </div>
  )
}
