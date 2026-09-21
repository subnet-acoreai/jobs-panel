import { useParams } from 'react-router-dom'
import { BRAND_NAME } from '../components/Brand'
import { useApi } from '../lib/useApi'

export default function Blog() {
  const { data, loading, error } = useApi('/api/blog')
  const posts = data?.posts || []

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-8">
      <h1 className="text-[26px] font-extrabold tracking-tight sm:text-3xl">Blog, Success Stories, Guides</h1>
      <p className="mt-2 text-sm text-gray-500">Hiring guides, workforce research, and product notes from {BRAND_NAME}.</p>
      {loading ? <p className="mt-8 text-sm text-gray-400">Loading posts…</p> : null}
      {error ? <p className="mt-8 text-sm text-red-500">{error}</p> : null}
      <div className="mt-8 space-y-5">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border border-gray-200 p-5 hover:border-brand/40 dark:border-night-line"
          >
            <h2 className="text-xl font-bold">{post.title}</h2>
            <p className="mt-1 text-xs text-gray-400">
              {post.author} · {new Date(post.date).toLocaleDateString()}
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-500">{post.excerpt}</p>
            <p className="mt-3 text-sm font-medium text-brand">Read source →</p>
          </a>
        ))}
      </div>
    </div>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 text-center">
      <h1 className="text-2xl font-bold">Open this post</h1>
      <a className="mt-4 inline-block text-brand" href={`https://cryptojobslist.com/blog/${slug}`} target="_blank" rel="noreferrer">
        cryptojobslist.com/blog/{slug}
      </a>
    </div>
  )
}
