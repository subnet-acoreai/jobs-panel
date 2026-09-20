import { categories } from '../data/site'
import { useApp } from '../context/AppContext'

export default function JobFilters() {
  const {
    query,
    setQuery,
    location,
    setLocation,
    category,
    setCategory,
    remoteOnly,
    setRemoteOnly,
    sort,
    setSort,
  } = useApp()

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Keyword, title, or company"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-night-line dark:bg-night-card"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-night-line dark:bg-night-card"
        />
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-night-line dark:bg-night-card">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="accent-brand"
          />
          Remote only
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-night-line dark:bg-night-card"
        >
          <option value="recent">Sort: Recent</option>
          <option value="relevant">Sort: Relevant</option>
          <option value="applications">Sort: Applications</option>
          <option value="salary">Sort: Salary</option>
        </select>
      </div>
      <div className="no-scrollbar flex flex-wrap gap-2 overflow-x-auto pb-1 sm:overflow-visible">
        <button
          type="button"
          onClick={() => setCategory('')}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
            !category ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(category === c.id ? '' : c.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              category === c.id
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-brand-soft dark:bg-white/10 dark:text-gray-300'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
