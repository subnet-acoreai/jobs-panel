import { useApp } from '../context/AppContext'

export default function SearchBar() {
  const { query, setQuery, location, setLocation, sort, setSort } = useApp()

  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-page px-3 py-2.5 text-sm dark:bg-night">
        <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search roles, companies, skills"
          className="min-w-0 w-full bg-transparent outline-none placeholder:text-muted/70"
        />
        {query ? (
          <button type="button" onClick={() => setQuery('')} className="shrink-0 text-muted hover:text-ink" aria-label="Clear search">
            ×
          </button>
        ) : null}
      </label>
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-page px-3 py-2.5 text-sm dark:bg-night">
        <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location or remote"
          className="min-w-0 w-full bg-transparent outline-none placeholder:text-muted/70"
        />
        {location ? (
          <button type="button" onClick={() => setLocation('')} className="shrink-0 text-muted hover:text-ink" aria-label="Clear location">
            ×
          </button>
        ) : null}
      </label>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="min-h-11 w-full min-w-0 rounded-2xl bg-page px-3 py-2.5 text-sm dark:bg-night sm:w-auto sm:min-w-[132px]"
      >
        <option value="recent">Recent</option>
        <option value="relevant">Relevant</option>
        <option value="salary">Salary</option>
      </select>
    </div>
  )
}
