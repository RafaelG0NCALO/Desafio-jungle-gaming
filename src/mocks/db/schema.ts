export const MOCK_SCHEMA_VERSION = '3'

const VERSION_KEY = 'kurio.mock.schema'
const OWNED_KEYS = ['kurio.session.token', 'kurio.visitor.id']

export function ensureMockSchema() {
  try {
    if (localStorage.getItem(VERSION_KEY) === MOCK_SCHEMA_VERSION) return
    const stale = Object.keys(localStorage).filter((key) => key.startsWith('kurio.mock.') || OWNED_KEYS.includes(key))
    for (const key of stale) localStorage.removeItem(key)
    localStorage.setItem(VERSION_KEY, MOCK_SCHEMA_VERSION)
  } catch {
  }
}
