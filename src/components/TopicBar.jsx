import { useState } from 'react'
import { topics } from '../data/topics'

export default function TopicBar({ active, onSelect }) {
  const [more, setMore] = useState(false)
  const visible = more ? topics : topics.slice(0, 14)

  return (
    <div className="flex max-w-full gap-1.5 overflow-x-auto overscroll-x-contain pb-1 no-scrollbar sm:flex-wrap">
      {visible.map((topic) => (
        <button
          key={topic.id}
          type="button"
          onClick={() => onSelect(topic.id === active ? 'for-you' : topic.id)}
          className={`min-h-9 shrink-0 rounded-full px-3 py-1.5 text-[12px] ${
            active === topic.id
              ? 'bg-ink font-semibold text-white dark:bg-accent dark:text-ink'
              : 'bg-page text-muted hover:text-ink dark:bg-night dark:hover:text-white'
          }`}
        >
          {topic.sparkle ? '✦ ' : ''}
          {topic.label}
        </button>
      ))}
      {topics.length > 14 && (
        <button type="button" onClick={() => setMore((v) => !v)} className="shrink-0 px-2 text-[12px] text-muted hover:text-ink">
          {more ? 'Less' : 'More'}
        </button>
      )}
    </div>
  )
}
