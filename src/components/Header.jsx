import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Logo } from './Brand'
import { useApp } from '../context/AppContext'

const nav = [
  { to: '/', label: 'Jobs' },
  { to: '/talent', label: 'Talent' },
  { to: '/salaries', label: 'Salaries' },
  { to: '/layoffs', label: 'Layoffs' },
  { to: '/research', label: 'Research' },
  { to: '/events', label: 'Events' },
  { to: '/blog', label: 'Blog' },
]

export default function Header() {
  const { theme, setTheme, user } = useApp()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur dark:bg-night/95">
      <div className="mx-auto flex h-[58px] max-w-[1360px] items-center justify-between gap-4 px-5">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-[20px] font-extrabold tracking-tight text-ink dark:text-white">
          <Logo className="h-7 w-7" />
          CryptoJobsList
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="hidden items-center gap-0.5 lg:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-2.5 py-1.5 text-[13px] ${
                    isActive ? 'bg-gray-100 font-medium text-ink dark:bg-white/10 dark:text-white' : 'text-gray-500 hover:text-ink dark:hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="hidden h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 sm:flex"
          >
            {isDark ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
              </svg>
            )}
          </button>

          <Link
            to="/login"
            aria-label="Account"
            className="hidden items-center gap-1 rounded-md px-2 py-1.5 text-[13px] text-gray-500 hover:bg-gray-100 hover:text-ink dark:hover:bg-white/10 dark:hover:text-white sm:flex"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5 19c1.6-3.2 4-4.8 7-4.8s5.4 1.6 7 4.8" />
            </svg>
            {user ? user.name?.split(' ')[0] : 'Sign in'}
          </Link>

          {user?.role === 'admin' ? (
            <Link to="/applications" className="hidden text-[13px] text-gray-500 hover:text-ink sm:inline dark:hover:text-white">
              Applications
            </Link>
          ) : null}
          <Link
            to="/hire"
            className="rounded-md bg-brand px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-brand-hover"
          >
            Hire
          </Link>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 px-5 py-3 lg:hidden dark:border-night-line">
          <div className="grid gap-1">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} className="rounded-md px-2 py-2 text-sm">
                {item.label}
              </NavLink>
            ))}
            {user?.role === 'admin' ? (
              <Link to="/applications" className="rounded-md px-2 py-2 text-sm">
                Applications
              </Link>
            ) : null}
            <Link to="/login" className="rounded-md px-2 py-2 text-sm">
              {user ? user.name : 'Sign in'}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
