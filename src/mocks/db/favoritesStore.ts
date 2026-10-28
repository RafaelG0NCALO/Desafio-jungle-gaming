type FavoritesDb = Record<string, string[]>

const STORAGE_KEY = 'kurio.mock.favorites'

function loadAll(): FavoritesDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as FavoritesDb
  } catch {
  }
  return {}
}

export function loadFavorites(userId: string): string[] {
  return loadAll()[userId] ?? []
}

export function saveFavorites(userId: string, ids: string[]) {
  try {
    const db = loadAll()
    db[userId] = ids
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
  }
}

export function resetFavorites() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
  }
}
