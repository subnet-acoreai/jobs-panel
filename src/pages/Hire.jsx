import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { COUNTRIES, LISTING_PRICE, readHireDraft, writeHireDraft } from '../lib/hire'

const input =
  'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand dark:border-night-line dark:bg-night-card'
const label = 'mb-1.5 block text-[13px] font-medium text-ink dark:text-white'

const press = ['Bloomberg', 'CoinDesk', 'CoinMarketCap', 'Bitcoin.com', 'The New York Times']
const trusted = ['Ethereum', 'Consensys', 'Chainlink', 'BitPay', 'f2pool', 'Maker', 'OKX', 'BIS']
const quotes = [
  { name: 'Julie Huang', role: 'People Operations, Cega', text: 'We hired a strong operations lead quickly. The applicant quality was consistently high.' },
  { name: 'Maike Northrop', role: 'Hiring Manager, Stackr', text: 'A focused Web3 audience. We filled a social role from a short, relevant shortlist.' },
  { name: 'Blake Moore', role: 'Head of Marketing, Labelium', text: 'Reach across several brands with one listing. We will keep posting here.' },
  { name: 'Kai Ansari', role: 'Product Lead, BLOCKBASE', text: 'Dozens of strong applications in days. Fast, relevant, and easy to manage.' },
  { name: 'Astley Milne', role: 'General Manager, MacLellan', text: 'Excellent candidates. We hired from the first batch and kept building the team.' },
  { name: 'Maria T. Vidal', role: 'Communications Lead, Status', text: 'More qualified inbound than AngelList for our crypto communications search.' },
]

export default function Hire() {
  const { user } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(() => ({
    title: '',
    company: '',
    description: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    period: 'Year',
    hideSalary: false,
    countryMode: 'include',
    countries: [],
    method: 'email',
    email: user?.email || '',
    recruiter: false,
    allowVideo: false,
    requireVideo: false,
    q1: '',
    q2: '',
    q3: '',
    video: '',
    ...(readHireDraft() || {}),
  }))

  useEffect(() => {
    if (user?.email && !form.email) setForm((current) => ({ ...current, email: user.email }))
  }, [user, form.email])

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function toggleCountry(name) {
    setForm((current) => ({
      ...current,
      countries: current.countries.includes(name)
        ? current.countries.filter((item) => item !== name)
        : [...current.countries, name],
    }))
  }

  function onSubmit(event) {
    event.preventDefault()
    writeHireDraft({ ...form, price: LISTING_PRICE })
    if (!user) {
      navigate('/login', { state: { from: '/hire/pay', mode: 'signin' } })
      return
    }
    navigate('/hire/pay')
  }

  return (
    <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-8 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-start">
      <form className="space-y-7" onSubmit={onSubmit}>
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Hire Top Web3, Crypto and Blockchain Talent</h1>
          <p className="mt-1 text-sm text-gray-500">
            Post your job on the largest Web3 hiring platform.
            {user ? ` Signed in as ${user.email}.` : ' Sign in with email to complete posting.'}
          </p>
        </div>

        <Field label="Job Title *">
          <input required className={input} placeholder="Solidity Engineer" value={form.title} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <Field label="Company Name *">
          <input required className={input} placeholder="Keep it short. Brand name like, Ltd." value={form.company} onChange={(e) => set('company', e.target.value)} />
        </Field>
        <Field label="Job Description *">
          <div className="mb-2 flex gap-1 text-gray-400">
            {['B', 'I', '•', '1.', '🔗'].map((mark) => (
              <span key={mark} className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-xs dark:border-night-line">
                {mark}
              </span>
            ))}
          </div>
          <textarea
            required
            rows={8}
            className={input}
            placeholder="Role, responsibilities, and requirements"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>

        <label className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2.5 text-sm dark:border-night-line">
          <span>Record a Video Description</span>
          <select className="bg-transparent text-gray-500 outline-none" value={form.video} onChange={(e) => set('video', e.target.value)}>
            <option value="">Optional</option>
            <option value="record">Record now</option>
            <option value="link">Add a link later</option>
          </select>
        </label>

        <Field label="Job Location">
          <input className={input} placeholder="Leave blank if 100% Remote" value={form.location} onChange={(e) => set('location', e.target.value)} />
        </Field>

        <div>
          <span className={label}>Salary Range *</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <input required className={input} placeholder="$0.00" value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} />
            <input required className={input} placeholder="$45,000" value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} />
            <select className={input} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
            <select className={input} value={form.period} onChange={(e) => set('period', e.target.value)}>
              <option>Year</option>
              <option>Month</option>
              <option>Hour</option>
            </select>
          </div>
          <label className="mt-2 flex items-center gap-2 text-[13px] text-gray-500">
            <input type="checkbox" checked={form.hideSalary} onChange={(e) => set('hideSalary', e.target.checked)} />
            Hide salary range from public view
          </label>
        </div>

        <div>
          <span className={label}>Country Filter</span>
          <div className="mb-2 flex gap-4 text-sm">
            {['include', 'exclude'].map((mode) => (
              <label key={mode} className="flex items-center gap-2">
                <input type="radio" checked={form.countryMode === mode} onChange={() => set('countryMode', mode)} />
                {mode === 'include' ? 'Include countries' : 'Exclude countries'}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COUNTRIES.map((country) => (
              <button
                type="button"
                key={country}
                onClick={() => toggleCountry(country)}
                className={`rounded-full border px-2.5 py-1 text-[12px] ${
                  form.countries.includes(country) ? 'border-brand bg-brand-soft text-brand' : 'border-gray-200 text-gray-500 dark:border-night-line'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        <section>
          <h2 className="text-lg font-bold">Application Method</h2>
          <div className="mt-3 flex gap-4 text-sm">
            {[
              ['email', 'Email'],
              ['redirect', 'Redirect to a form'],
            ].map(([id, labelText]) => (
              <label key={id} className="flex items-center gap-2">
                <input type="radio" checked={form.method === id} onChange={() => set('method', id)} />
                {labelText}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-gray-400">Applications will be emailed to you and stored in your hiring inbox.</p>
          <Field label="Email for receiving applications. Stays private. *">
            <input required type="email" className={input} value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-gray-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.recruiter} onChange={(e) => set('recruiter', e.target.checked)} />
              Recruiter / Contractor
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.allowVideo} onChange={(e) => set('allowVideo', e.target.checked)} />
              Allow Video Applications
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.requireVideo} onChange={(e) => set('requireVideo', e.target.checked)} />
              Require Video Applications
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold">Screening Questions</h2>
          <p className="mt-1 text-[13px] text-gray-500">Ask up to 3 short questions so you can screen candidates faster.</p>
          <div className="mt-3 space-y-3">
            <input className={input} placeholder="Question 1" value={form.q1} onChange={(e) => set('q1', e.target.value)} />
            <input className={input} placeholder="Question 2" value={form.q2} onChange={(e) => set('q2', e.target.value)} />
            <input className={input} placeholder="Question 3 — keep it to one sentence" value={form.q3} onChange={(e) => set('q3', e.target.value)} />
          </div>
        </section>

        <button className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-hover">
          Post your job — ${LISTING_PRICE}
        </button>
      </form>

      <aside className="space-y-10">
        <div>
          <p className="text-center text-[12px] uppercase tracking-wide text-gray-400">Teams hiring with us</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {trusted.map((name) => (
              <span key={name} className="rounded-full border border-gray-200 px-3 py-1 text-[13px] font-semibold text-gray-600 dark:border-night-line">
                {name}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-center text-[12px] uppercase tracking-wide text-gray-400">Covered by Crypto & Web3 Media</p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-gray-500">
            {press.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-center text-[12px] uppercase tracking-wide text-gray-400">What our customers are saying</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {quotes.map((quote) => (
              <article key={quote.name} className="rounded-2xl border border-gray-200 p-4 dark:border-night-line">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                    {quote.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{quote.name}</p>
                    <p className="text-[11px] text-gray-400">{quote.role}</p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] leading-5 text-gray-600">{quote.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-center text-[12px] uppercase tracking-wide text-gray-400">Everything you need to hire well</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Screening Questions', 'Ask up to 3 questions so you can shortlist faster.'],
              ['Video Applications', 'Screen for communication and culture fit in minutes.'],
              ['Mini ATS', 'Track applicants, notes, and listing performance in one place.'],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-gray-200 p-4 dark:border-night-line">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-[13px] text-gray-500">{body}</p>
              </article>
            ))}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          {[
            ['80k+', 'Newsletter subscribers'],
            ['70k+', 'Social audience'],
            ['24', 'Avg applications / job'],
            ['469', 'Jobs live'],
          ].map(([stat, caption]) => (
            <div key={caption}>
              <dt className="text-xl font-extrabold">{stat}</dt>
              <dd className="text-[12px] text-gray-400">{caption}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  )
}

function Field({ label: text, children }) {
  return (
    <label className="block">
      <span className={label}>{text}</span>
      {children}
    </label>
  )
}
