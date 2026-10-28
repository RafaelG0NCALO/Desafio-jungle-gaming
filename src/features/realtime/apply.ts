import type { QueryClient } from '@tanstack/react-query'
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/api/events'
import type { Cart } from '@/api/cart'
import type { Nft, NftDetail, NftListResponse } from '@/api/nfts'
import type { Order } from '@/api/orders'
import { cartKeys } from '@/features/cart/hooks'
import { nftKeys } from '@/features/catalog/hooks'
import { pushNotice } from './store'

export class SeenEvents {
  private ids = new Set<string>()
  private limit: number
  constructor(limit = 200) {
    this.limit = limit
  }
  seen(id: string) {
    if (this.ids.has(id)) return true
    this.ids.add(id)
    if (this.ids.size > this.limit) this.ids.delete(this.ids.values().next().value as string)
    return false
  }
}

function knownNftVersion(queryClient: QueryClient, id: string) {
  let version = queryClient.getQueryData<NftDetail>(nftKeys.detail(id))?.version ?? 0
  for (const [, list] of queryClient.getQueriesData<NftListResponse>({ queryKey: [...nftKeys.all, 'list'] })) {
    for (const item of list?.items ?? []) if (item.id === id) version = Math.max(version, item.version)
  }
  const featured = queryClient.getQueryData<Nft>(nftKeys.featured())
  if (featured?.id === id) version = Math.max(version, featured.version)
  return version
}

export function applyNftUpdated(queryClient: QueryClient, event: NftUpdatedEvent) {
  const id = event.resourceId
  if (event.version <= knownNftVersion(queryClient, id)) return
  const { price, previousPrice, editions } = event.data
  const patch = { price, previousPrice, version: event.version }

  const detail = queryClient.getQueryData<NftDetail>(nftKeys.detail(id))
  if (detail) {
    if (detail.price !== price) {
      pushNotice({ scope: 'nft', resourceId: id, message: `O preço de ${detail.name} mudou de ${detail.price} para ${price} ETH.` })
    }
    queryClient.setQueryData<NftDetail>(nftKeys.detail(id), {
      ...detail,
      ...patch,
      editions: detail.editions.map((edition) => (edition.id in editions ? { ...edition, available: editions[edition.id] } : edition)),
    })
  }
  queryClient.setQueriesData<NftListResponse>(
    { queryKey: [...nftKeys.all, 'list'] },
    (list) => list && { ...list, items: list.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) },
  )
  queryClient.setQueryData<Nft>(nftKeys.featured(), (featured) => (featured?.id === id ? { ...featured, ...patch } : featured))
  queryClient.invalidateQueries({ queryKey: [...nftKeys.all, 'list'] })

  let touchesCart = false
  for (const [, cart] of queryClient.getQueriesData<Cart>({ queryKey: cartKeys.all })) {
    for (const item of cart?.items ?? []) {
      if (item.nftId !== id) continue
      touchesCart = true
      if (item.unitPrice !== price) {
        pushNotice({ scope: 'cart', resourceId: id, message: `${item.name}: o preço mudou de ${item.unitPrice} para ${price} ETH.` })
      }
      const left = editions[item.edition.id]
      if (left !== undefined && left !== null && left < item.quantity) {
        pushNotice({
          scope: 'cart',
          resourceId: id,
          message:
            left === 0
              ? `${item.name} (${item.edition.label}) esgotou.`
              : `${item.name} (${item.edition.label}): restam ${left} ${left === 1 ? 'unidade' : 'unidades'} e o carrinho tem ${item.quantity}.`,
        })
      }
    }
  }
  if (touchesCart) queryClient.invalidateQueries({ queryKey: cartKeys.all })
}

export function applyOrderUpdated(queryClient: QueryClient, event: OrderUpdatedEvent) {
  let applied = false
  for (const [key, order] of queryClient.getQueriesData<Order>({ queryKey: ['orders'] })) {
    if (!order || order.id !== event.resourceId || (order.version ?? 1) >= event.version) continue
    queryClient.setQueryData<Order>(key, { ...order, status: event.data.status, version: event.version })
    applied = true
  }
  if (!applied) return
  if (event.data.status === 'confirmed') queryClient.invalidateQueries({ queryKey: cartKeys.all })
  pushNotice({
    scope: 'order',
    resourceId: event.resourceId,
    message:
      event.data.status === 'confirmed' ? 'Seu pedido foi confirmado.' : event.data.status === 'declined' ? 'Seu pedido foi recusado.' : 'Seu pedido está pendente.',
  })
}

export function reconcile(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: nftKeys.all })
  queryClient.invalidateQueries({ queryKey: cartKeys.all })
  queryClient.invalidateQueries({ queryKey: ['orders'] })
}
