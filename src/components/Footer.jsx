import { Link } from 'react-router-dom'
import { Logo, SocialLinks } from './Brand'
import { categories, cities } from '../data/site'

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-gray-100 bg-white dark:border-night-line dark:bg-night">
      <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-7 w-7" />
            <span className="font-bold">CryptoJobsList</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-gray-500">
            The web’s biggest list of cryptocurrency, blockchain, and Web3 jobs. Founded in 2017.
          </p>
          <SocialLinks className="mt-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Browse by role</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            {categories.map((c) => (
              <li key={c.id}>
                <Link className="hover:text-brand" to={`/?category=${c.id}`}>
                  {c.emoji} {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Browse by location</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li>
              <Link className="hover:text-brand" to="/?remote=1">
                Remote
              </Link>
            </li>
            {cities.slice(0, 7).map((c) => (
              <li key={c}>
                <Link className="hover:text-brand" to={`/?location=${encodeURIComponent(c)}`}>
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li>
              <Link className="hover:text-brand" to="/hire">
                Post jobs
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand" to="/talent">
                Hire talent
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand" to="/salaries">
                Salary guide
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand" to="/research">
                Research
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand" to="/about">
                About us
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand" to="/blog">
                Blog
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-400 dark:border-night-line">
        UI recreation for demo purposes. Not affiliated with the production CryptoJobsList service.
      </div>
    </footer>
  )
}
