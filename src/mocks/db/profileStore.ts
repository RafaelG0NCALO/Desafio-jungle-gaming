import type { Profile } from '@/api/profile'
import type { MockUser } from './authStore'

type ProfileDb = Record<string, Profile>

const STORAGE_KEY = 'kurio.mock.profiles'

function load(): ProfileDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ProfileDb
  } catch {
  }
  return {}
}

function save(db: ProfileDb) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
  }
}

export function loadProfile(user: MockUser): Profile {
  return (
    load()[user.id] ?? {
      displayName: user.name,
      username: user.username,
      email: user.email,
      ensName: user.username.split('_')[0],
      ensSuffix: '.eth',
      walletNickname: 'Principal',
      avatarUrl: null,
    }
  )
}

export function saveProfile(userId: string, profile: Profile) {
  const db = load()
  db[userId] = profile
  save(db)
}

export function resetProfiles() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
  }
}
