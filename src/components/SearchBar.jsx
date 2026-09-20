import { useApp } from '../context/AppContext'

export default function SearchBar() {
  const { query, setQuery, location, setLocation, sort, setSort } = useApp()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex min-w-[160px] flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm dark:border-night-line dark:bg-night-card">
        <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs, companies, skills"
          className="w-full bg-transparent outline-none placeholder:text-gray-400"
        />
        {query ? (
          <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-ink" aria-label="Clear search">
            ×
          </button>
        ) : null}
      </label>
      <label className="flex min-w-[160px] flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm dark:border-night-line dark:bg-night-card">
        <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location, Remote"
          className="w-full bg-transparent outline-none placeholder:text-gray-400"
        />
        {location ? (
          <button type="button" onClick={() => setLocation('')} className="text-gray-400 hover:text-ink" aria-label="Clear location">
            ×
          </button>
        ) : null}
      </label>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm dark:border-night-line dark:bg-night-card"
      >
        <option value="recent">Recent</option>
        <option value="relevant">Relevant</option>
        <option value="salary">Salary</option>
      </select>
    </div>
  )
}
