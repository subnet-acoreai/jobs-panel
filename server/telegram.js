import './env.js'

const API = 'https://api.telegram.org'

function token() {
  return String(process.env.TELEGRAM_BOT_TOKEN || '').trim()
}

function chatId() {
  return String(process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHANNEL_ID || '').trim()
}

export function telegramConfigured() {
  return Boolean(token() && chatId())
}

export async function sendTelegram(text) {
  if (!telegramConfigured()) return { skipped: true }
  const body = {
    chat_id: chatId(),
    text: String(text || '').slice(0, 3900),
    disable_web_page_preview: true,
  }
  const res = await fetch(`${API}/bot${token()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(payload.description || `Telegram HTTP ${res.status}`)
  }
  return { ok: true }
}
