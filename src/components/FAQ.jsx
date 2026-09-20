import { useState } from 'react'
import { faqs } from '../data/site'

export default function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section className="mt-14">
      <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
      <div className="mt-4 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 dark:divide-night-line dark:border-night-line">
        {faqs.map((item, i) => (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? -1 : i)}
              className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold"
            >
              {item.q}
              <span className="text-gray-400">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <p className="px-4 pb-4 text-sm leading-6 text-gray-500">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

export function Newsletter() {
  const [done, setDone] = useState(false)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setDone(true)
      }}
      className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-night-line dark:bg-night-card"
    >
      <h3 className="text-lg font-bold">Best jobs in crypto, in your inbox</h3>
      <p className="mt-1 text-sm text-gray-500">Weekly. No banks-win energy required.</p>
      {done ? (
        <p className="mt-4 text-sm font-medium text-brand">You’re on the list.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            placeholder="Enter your e-mail"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-night-line dark:bg-night"
          />
          <button className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">
            Subscribe
          </button>
        </div>
      )}
    </form>
  )
}
