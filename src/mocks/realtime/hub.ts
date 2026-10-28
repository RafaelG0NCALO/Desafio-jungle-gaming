import type { NftUpdatedEvent, OrderUpdatedEvent, RealtimeEvent } from '@/api/events'
import type { Nft } from '@/api/nfts'
import type { Order } from '@/api/orders'
import { detailOf } from '../db/catalogStore'

export interface Client {
  userId: string | null
  send: (event: RealtimeEvent) => void
  close: () => void
}

const clients = new Set<Client>()
const recent: { event: RealtimeEvent; audience: string | null }[] = []
let blockedUntil = 0

export const register = (client: Client) => {
  clients.add(client)
  return () => clients.delete(client)
}

export const isBlocked = () => Date.now() < blockedUntil

function remember(event: RealtimeEvent, audience: string | null) {
  recent.push({ event, audience })
  if (recent.length > 20) recent.shift()
}

const occurredAt = () => new Date().toISOString()

export function nftEvent(nft: Nft): NftUpdatedEvent {
  const { editions } = detailOf(nft)
  return {
    id: `evt-nft-${nft.id}-v${nft.version}`,
    type: 'nft.updated',
    resource: 'nft',
    resourceId: nft.id,
    version: nft.version,
    occurredAt: occurredAt(),
    data: {
      price: nft.price,
      previousPrice: nft.previousPrice,
      editions: Object.fromEntries(editions.map((edition) => [edition.id, edition.available])),
    },
  }
}

export function publishNft(nft: Nft) {
  const event = nftEvent(nft)
  remember(event, null)
  for (const client of clients) client.send(event)
}

export function publishOrder(order: Order, ownerId: string) {
  const event: OrderUpdatedEvent = {
    id: `evt-ord-${order.id}-v${order.version ?? 1}`,
    type: 'order.updated',
    resource: 'order',
    resourceId: order.id,
    version: order.version ?? 1,
    occurredAt: occurredAt(),
    data: { status: order.status },
  }
  remember(event, ownerId)
  for (const client of clients) if (client.userId === ownerId) client.send(event)
}

export function resendRecent() {
  for (const { event, audience } of recent) {
    for (const client of clients) if (audience === null || client.userId === audience) client.send(event)
  }
  return recent.length
}

export function sendStale(nft: Nft) {
  const stale = nftEvent({ ...nft, version: Math.max(1, nft.version - 1), price: nft.previousPrice ?? '0.01' })
  for (const client of clients) client.send(stale)
  return stale
}

export function dropConnections(blockMs = 0) {
  blockedUntil = Date.now() + blockMs
  for (const client of [...clients]) client.close()
}

export const connectionCount = () => clients.size
