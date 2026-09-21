import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { loadEnv } from './env.js'

loadEnv()

const sessions = new Map()
const COOKIE = 'cjl_session'
const LEGACY_COOKIE = 'cjl_admin'
const WEEK = 7 * 24 * 60 * 60 * 1000
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cryptojobslist.local'
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

function cookieValue(req, name) {
  const raw = req.headers.cookie || ''
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return ''
}

function readToken(req) {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return cookieValue(req, COOKIE) || cookieValue(req, LEGACY_COOKIE) || String(req.query.token || '')
}

function publicUser(user) {
  return { name: user.name, email: user.email, role: user.role || 'user' }
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(String(password), salt, 32).toString('hex')
  return { salt, hash }
}

function verifyPassword(password, salt, hash) {
  try {
    const next = scryptSync(String(password), salt, 32)
    const prev = Buffer.from(hash, 'hex')
    if (next.length !== prev.length) return false
    return timingSafeEqual(prev, next)
  } catch {
    return false
  }
}

function readUsers() {
  try {
    const parsed = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeUsers(users) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true })
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

function findUser(email) {
  const needle = String(email || '').trim().toLowerCase()
  return readUsers().find((user) => user.email === needle) || null
}

export function getSession(req) {
  const token = readToken(req)
  const session = sessions.get(token)
  if (!session || session.exp < Date.now()) {
    if (token) sessions.delete(token)
    return null
  }
  return session
}

export function createSession(res, user) {
  const token = randomBytes(32).toString('hex')
  const safe = publicUser(user)
  sessions.set(token, { ...safe, exp: Date.now() + WEEK })
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(WEEK / 1000)}`,
  )
  return { token, user: safe }
}

export function createAdminSession(res) {
  return createSession(res, { name: 'Admin', email: ADMIN_EMAIL, role: 'admin' })
}

export function clearSession(req, res) {
  const token = readToken(req)
  if (token) sessions.delete(token)
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`)
}

export function clearAdminSession(req, res) {
  clearSession(req, res)
}

export function requireUser(req, res, next) {
  const session = getSession(req)
  if (!session) return res.status(401).json({ message: 'Sign in required' })
  req.user = session
  next()
}

export function requireAdmin(req, res, next) {
  const session = getSession(req)
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ message: 'Admin only' })
  }
  req.admin = session
  next()
}

export function loginAdmin(email, password) {
  return (
    String(email || '').trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    String(password || '') === ADMIN_PASSWORD
  )
}

export async function signupUser({ name, email, password }) {
  const trimmedEmail = String(email || '').trim().toLowerCase()
  const trimmedName = String(name || '').trim() || trimmedEmail.split('@')[0]
  const pass = String(password || '')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) throw new Error('Enter a valid email')
  if (pass.length < 8) throw new Error('Password must be at least 8 characters')
  if (trimmedEmail === ADMIN_EMAIL.toLowerCase()) throw new Error('This email is reserved. Sign in instead.')
  if (findUser(trimmedEmail)) throw new Error('An account with this email already exists')
  const { salt, hash } = hashPassword(pass)
  const user = {
    id: randomBytes(12).toString('hex'),
    name: trimmedName,
    email: trimmedEmail,
    salt,
    hash,
    role: 'user',
    createdAt: new Date().toISOString(),
  }
  const users = readUsers()
  users.push(user)
  writeUsers(users)
  return publicUser(user)
}

export async function loginUser(email, password) {
  const trimmedEmail = String(email || '').trim().toLowerCase()
  const pass = String(password || '')
  if (loginAdmin(trimmedEmail, pass)) {
    return { name: 'Admin', email: ADMIN_EMAIL, role: 'admin' }
  }
  const user = findUser(trimmedEmail)
  if (!user || !verifyPassword(pass, user.salt, user.hash)) return null
  return publicUser(user)
}
