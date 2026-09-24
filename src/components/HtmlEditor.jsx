import { useEffect, useRef, useState } from 'react'
import { cleanJobHtml } from '../../shared/cleanHtml.js'

const tools = [
  { cmd: 'bold', label: 'B', title: 'Bold' },
  { cmd: 'italic', label: 'I', title: 'Italic' },
  { cmd: 'underline', label: 'U', title: 'Underline' },
  { cmd: 'formatBlock', arg: 'h2', label: 'H2', title: 'Heading' },
  { cmd: 'formatBlock', arg: 'h3', label: 'H3', title: 'Subheading' },
  { cmd: 'insertUnorderedList', label: '•', title: 'Bullet list' },
  { cmd: 'insertOrderedList', label: '1.', title: 'Numbered list' },
]

export default function HtmlEditor({ value = '', onChange }) {
  const ref = useRef(null)
  const [mode, setMode] = useState('visual')

  useEffect(() => {
    if (mode !== 'visual' || !ref.current) return
    if (document.activeElement === ref.current) return
    const next = value || ''
    if (ref.current.innerHTML !== next) ref.current.innerHTML = next
  }, [value, mode])

  function emit(html, keepEmpty = false) {
    onChange(cleanJobHtml(html, { keepEmpty }))
  }

  function run(cmd, arg) {
    ref.current?.focus()
    document.execCommand(cmd, false, arg)
    emit(ref.current?.innerHTML || '')
  }

  function addLink() {
    const url = window.prompt('Link URL', 'https://')
    if (!url) return
    run('createLink', url)
  }

  function onPaste(event) {
    event.preventDefault()
    const html = event.clipboardData.getData('text/html')
    const text = event.clipboardData.getData('text/plain')
    document.execCommand(
      'insertHTML',
      false,
      cleanJobHtml(
        html ||
          text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br />'),
      ),
    )
    emit(ref.current?.innerHTML || '')
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white dark:border-night-line dark:bg-night-card">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 dark:border-night-line">
        {tools.map((tool) => (
          <button
            key={tool.title}
            type="button"
            title={tool.title}
            disabled={mode !== 'visual'}
            onClick={() => run(tool.cmd, tool.arg)}
            className="flex h-8 min-w-8 items-center justify-center rounded border border-gray-200 px-2 text-xs font-semibold disabled:opacity-40 dark:border-night-line"
          >
            {tool.label}
          </button>
        ))}
        <button
          type="button"
          title="Link"
          disabled={mode !== 'visual'}
          onClick={addLink}
          className="flex h-8 min-w-8 items-center justify-center rounded border border-gray-200 px-2 text-xs disabled:opacity-40 dark:border-night-line"
        >
          🔗
        </button>
        <div className="ml-auto flex rounded-full bg-page p-0.5 text-[12px] dark:bg-night">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={`rounded-full px-2.5 py-1 ${mode === 'visual' ? 'bg-ink text-white dark:bg-accent dark:text-ink' : 'text-muted'}`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode('html')}
            className={`rounded-full px-2.5 py-1 ${mode === 'html' ? 'bg-ink text-white dark:bg-accent dark:text-ink' : 'text-muted'}`}
          >
            HTML
          </button>
        </div>
      </div>
      {mode === 'visual' ? (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Write the role, responsibilities, and requirements. Paste HTML if you have it."
          className="prose-job html-editor min-h-[240px] px-3 py-3 outline-none"
          onInput={(event) => emit(event.currentTarget.innerHTML, true)}
          onPaste={onPaste}
          onBlur={(event) => emit(event.currentTarget.innerHTML)}
        />
      ) : (
        <textarea
          className="min-h-[240px] w-full resize-y bg-transparent px-3 py-3 font-mono text-[13px] leading-6 outline-none"
          value={value}
          onChange={(event) => emit(event.target.value)}
          spellCheck={false}
        />
      )}
    </div>
  )
}
