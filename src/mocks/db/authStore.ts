import { HttpResponse } from 'msw'
import { sha256 } from './hash'

export interface MockUser {
  id: string
  name: string
  username: string
  email: string
  passwordHash: string
}

interface AuthDb {
  users: MockUser[]
  sessions: Record<string, { userId: string; expiresAt: number }>
}

const STORAGE_KEY = 'kurio.mock.auth'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

export const DEMO_USERS = [
  { id: 'u-marina', name: 'Marina Costa', username: 'marina_costa', email: 'marina@email.com', password: 'Kurio@123' },
  { id: 'u-rafael', name: 'Rafael Dias', username: 'rafael_dias', email: 'rafael@email.com', password: 'Kurio@456' },
] as const

export const publicUser = ({ id, name, username, email }: MockUser) => ({ id, name, username, email })

async function seed(): Promise<AuthDb> {
  const users = await Promise.all(
    DEMO_USERS.map(async ({ password, ...user }) => ({ ...user, passwordHash: await sha256(password) })),
  )
  return { users, sessions: {} }
}

export async function loadAuth(): Promise<AuthDb> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AuthDb
  } catch {
  }
  return seed()
}

export function saveAuth(db: AuthDb) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
  }
}

export function resetAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
  }
}

export function startSession(db: AuthDb, userId: string): string {
  const token = `tok-${crypto.randomUUID()}`
  db.sessions[token] = { userId, expiresAt: Date.now() + SESSION_TTL_MS }
  return token
}

const fail = (code: string, message: string) => HttpResponse.json({ code, message }, { status: 401 })

type Authenticated = { ok: true; user: MockUser; db: AuthDb; token: string } | { ok: false; response: Response }

export async function authenticate(request: Request): Promise<Authenticated> {
  const header = request.headers.get('Authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return { ok: false, response: fail('unauthenticated', 'Faça login para continuar.') }

  const db = await loadAuth()
  const session = db.sessions[token]
  if (!session) return { ok: false, response: fail('session_expired', 'Sua sessão expirou. Entre novamente.') }
  if (session.expiresAt < Date.now()) {
    delete db.sessions[token]
    saveAuth(db)
    return { ok: false, response: fail('session_expired', 'Sua sessão expirou. Entre novamente.') }
  }
  const user = db.users.find((u) => u.id === session.userId)
  if (!user) return { ok: false, response: fail('session_expired', 'Sua sessão expirou. Entre novamente.') }
  return { ok: true, user, db, token }
}

export async function resolveOwner(request: Request): Promise<{ owner: string; user: MockUser | null }> {
  const auth = await authenticate(request)
  if (auth.ok) return { owner: `u:${auth.user.id}`, user: auth.user }
  return { owner: `v:${request.headers.get('X-Visitor-Id') ?? 'anonimo'}`, user: null }
}
