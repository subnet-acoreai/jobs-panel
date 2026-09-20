import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR = path.join(process.cwd(), 'data')
const STORE_FILE = path.join(DATA_DIR, 'applications.json')

async function readAll() {
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeAll(items) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(STORE_FILE, JSON.stringify(items, null, 2))
}

export async function listApplications() {
  const items = await readAll()
  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function getApplication(id) {
  return (await readAll()).find((item) => item.id === id) || null
}

export async function createApplication(data) {
  const items = await readAll()
  const application = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
  }
  items.push(application)
  await writeAll(items)
  return application
}
