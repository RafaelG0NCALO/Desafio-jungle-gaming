import { saveCart } from '../db/cartStore'
import { loadOrders, saveOrders } from '../db/orderStore'
import { publishOrder } from './hub'

export function settleOrder(id: string, { notify = true } = {}) {
  const db = loadOrders()
  const due = db.settle?.[id]
  const order = db.orders[id]
  if (!due || !order || order.status !== 'pending') return false
  order.status = due.to
  order.version = (order.version ?? 1) + 1
  delete db.settle![id]
  if (due.to === 'confirmed') saveCart(`u:${db.owners[id]}`, { lines: [], couponCode: null })
  saveOrders(db)
  if (notify) publishOrder(order, db.owners[id])
  return true
}

const timers = new Map<string, ReturnType<typeof setTimeout>>()

export function scheduleSettle(id: string) {
  const due = loadOrders().settle?.[id]
  if (!due) return
  clearTimeout(timers.get(id))
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id)
      settleOrder(id)
    }, Math.max(0, due.at - Date.now())),
  )
}

export function resumePendingOrders() {
  for (const id of Object.keys(loadOrders().settle ?? {})) scheduleSettle(id)
}
