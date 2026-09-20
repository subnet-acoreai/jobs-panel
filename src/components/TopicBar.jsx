import { useState } from 'react'
import { topics } from '../data/topics'

export default function TopicBar({ active, onSelect }) {
  const [more, setMore] = useState(false)
  const visible = more ? topics : topics.slice(0, 18)

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[13px] text-gray-500">
      {visible.map((topic, i) => (
        <span key={topic.id} className="inline-flex items-center">
          {i > 0 && <span className="mr-1.5 text-gray-300">·</span>}
          <button
            type="button"
            onClick={() => onSelect(topic.id === active ? 'for-you' : topic.id)}
            className={`hover:text-ink dark:hover:text-white ${active === topic.id ? 'font-semibold text-ink dark:text-white' : ''}`}
          >
            {topic.sparkle ? <span className="mr-1">✦</span> : null}
            {topic.label}
          </button>
        </span>
      ))}
      {topics.length > 18 && (
        <button type="button" onClick={() => setMore((v) => !v)} className="ml-1 text-gray-400 hover:text-ink">
          {more ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
