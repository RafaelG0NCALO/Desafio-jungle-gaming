import { resetScenario } from '../scenarios/engine'
import { MOCK_SCHEMA_VERSION } from './schema'

const OWNED_KEYS = ['kurio.session.token', 'kurio.visitor.id']

export function resetMockData() {
  try {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith('kurio.mock.') || OWNED_KEYS.includes(key))
    for (const key of keys) localStorage.removeItem(key)
    for (const key of Object.keys(sessionStorage).filter((k) => k.startsWith('kurio.'))) sessionStorage.removeItem(key)
    localStorage.setItem('kurio.mock.schema', MOCK_SCHEMA_VERSION)
  } catch {
  }
  resetScenario()
}
