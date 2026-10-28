import { useSyncExternalStore } from 'react'

function createStore<T>(initial: T) {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    get: () => state,
    set(next: T) {
      state = next
      listeners.forEach((listener) => listener())
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

const connection = createStore(false)

export const setRealtimeConnected = connection.set
export const useRealtimeConnected = () => useSyncExternalStore(connection.subscribe, connection.get)

export interface LiveNotice {
  id: string
  scope: 'cart' | 'nft' | 'order' | 'connection'
  resourceId?: string
  message: string
}

const notices = createStore<LiveNotice[]>([])

export function pushNotice(notice: Omit<LiveNotice, 'id'>) {
  const current = notices.get()
  if (current.some((n) => n.scope === notice.scope && n.resourceId === notice.resourceId && n.message === notice.message)) return
  notices.set([...current, { ...notice, id: crypto.randomUUID() }].slice(-5))
}

export const dismissNotice = (id: string) => notices.set(notices.get().filter((n) => n.id !== id))
export const clearNotices = (scope: LiveNotice['scope']) => notices.set(notices.get().filter((n) => n.scope !== scope))
export const useLiveNotices = () => useSyncExternalStore(notices.subscribe, notices.get)
