import type { Order } from '@/api/orders'

interface OrderDb {
  orders: Record<string, Order>
  keys: Record<string, { body: string; orderId: string }>
  owners: Record<string, string>
  settle?: Record<string, { at: number; to: 'confirmed' | 'declined' }>
}

const STORAGE_KEY = 'kurio.mock.orders'

export function loadOrders(): OrderDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const db = JSON.parse(raw) as Partial<OrderDb>
      return { orders: db.orders ?? {}, keys: db.keys ?? {}, owners: db.owners ?? {}, settle: db.settle ?? {} }
    }
  } catch {
  }
  return { orders: {}, keys: {}, owners: {}, settle: {} }
}

export function saveOrders(db: OrderDb) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
  }
}

export function resetOrders() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
  }
}
