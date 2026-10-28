import type { WalletConnection } from '@/api/walletConnection'

type ConnectionDb = Record<string, WalletConnection>

const STORAGE_KEY = 'kurio.mock.connections'

function load(): ConnectionDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ConnectionDb
  } catch {
  }
  return {}
}

function save(db: ConnectionDb) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
  }
}

export const loadConnection = (userId: string): WalletConnection | null => load()[userId] ?? null

export function saveConnection(userId: string, connection: WalletConnection) {
  const db = load()
  db[userId] = connection
  save(db)
}

export function clearConnection(userId: string) {
  const db = load()
  delete db[userId]
  save(db)
}

export function dropAllConnections() {
  save({})
}
