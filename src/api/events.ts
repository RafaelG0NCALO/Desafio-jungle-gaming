import type { OrderStatus } from './orders'

interface BaseEvent<T extends string, R extends string> {
  id: string
  type: T
  resource: R
  resourceId: string
  version: number
  occurredAt: string
}

export interface NftUpdatedEvent extends BaseEvent<'nft.updated', 'nft'> {
  data: {
    price: string
    previousPrice: string | null
    editions: Record<string, number | null>
  }
}

export interface OrderUpdatedEvent extends BaseEvent<'order.updated', 'order'> {
  data: { status: OrderStatus }
}

export type RealtimeEvent = NftUpdatedEvent | OrderUpdatedEvent

export const EVENT_TYPES = ['nft.updated', 'order.updated'] as const

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

function hasEnvelope(value: unknown, type: string, resource: string): value is Record<string, unknown> {
  return (
    isObject(value) &&
    value.type === type &&
    value.resource === resource &&
    typeof value.id === 'string' &&
    typeof value.resourceId === 'string' &&
    typeof value.version === 'number' &&
    isObject(value.data)
  )
}

export function isNftUpdated(value: unknown): value is NftUpdatedEvent {
  if (!hasEnvelope(value, 'nft.updated', 'nft')) return false
  const data = value.data as Record<string, unknown>
  return typeof data.price === 'string' && isObject(data.editions)
}

export function isOrderUpdated(value: unknown): value is OrderUpdatedEvent {
  if (!hasEnvelope(value, 'order.updated', 'order')) return false
  const status = (value.data as Record<string, unknown>).status
  return status === 'pending' || status === 'confirmed' || status === 'declined'
}
