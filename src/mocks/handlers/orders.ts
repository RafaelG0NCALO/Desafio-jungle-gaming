import { delay, http, HttpResponse } from 'msw'
import type { CreateOrderInput, Order, OrderChange } from '@/api/orders'
import { authenticate } from '../db/authStore'
import { buildCart, COUPONS, loadCart, saveCart } from '../db/cartStore'
import { isCouponExpired } from '../db/catalogStore'
import { loadConnection } from '../db/connectionStore'
import { loadOrders, saveOrders } from '../db/orderStore'
import { scheduleSettle, settleOrder } from '../realtime/settle'
import { getScenario } from '../scenarios/engine'

const error = (status: number, code: string, message: string, extra: object = {}) =>
  HttpResponse.json({ code, message, ...extra }, { status })

let timeoutsServed = 0

function settleIfDue(id: string) {
  const due = loadOrders().settle?.[id]
  if (due && Date.now() >= due.at) settleOrder(id, { notify: false })
}

export const orderHandlers = [
  http.post('/api/orders', async ({ request }) => {
    await delay(500)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    const rawKey = request.headers.get('Idempotency-Key')
    if (!rawKey) return error(422, 'validation_error', 'Envie a chave de idempotência do pedido.')
    const key = `${auth.user.id}:${rawKey}`

    const rawBody = await request.text()
    const db = loadOrders()

    const previous = db.keys[key]
    if (previous) {
      if (previous.body !== rawBody) {
        return error(409, 'idempotency_conflict', 'Esta chave já foi usada com outro conteúdo.')
      }
      return HttpResponse.json(db.orders[previous.orderId])
    }

    const input = JSON.parse(rawBody) as CreateOrderInput
    const owner = `u:${auth.user.id}`
    const cart = loadCart(owner)
    let current = buildCart(cart)
    if (current.items.length === 0) return error(422, 'empty_cart', 'Seu carrinho está vazio.')


    const connection = loadConnection(auth.user.id)
    if (
      !connection ||
      connection.provider !== input.wallet.type ||
      connection.network !== input.wallet.network ||
      connection.address.toLowerCase() !== input.wallet.address.toLowerCase()
    ) {
      return error(409, 'wallet_disconnected', 'A carteira não está conectada. Conecte novamente para confirmar a compra.')
    }

    const stock: OrderChange[] = current.items
      .filter((item) => item.quantity > item.maxQuantity)
      .map((item) => ({
        type: 'availability' as const,
        nftId: item.nftId,
        message:
          item.maxQuantity === 0
            ? `${item.name} (${item.edition.label}) esgotou.`
            : `${item.name} (${item.edition.label}): restam ${item.maxQuantity} ${item.maxQuantity === 1 ? 'unidade' : 'unidades'} e o carrinho tem ${item.quantity}.`,
      }))
    if (stock.length) {
      return error(409, 'availability_conflict', 'A disponibilidade mudou. Ajuste as quantidades no carrinho e confirme de novo.', {
        quote: current.quote,
        changes: stock,
      })
    }

    const changes: OrderChange[] = []

    if (cart.couponCode && (!(cart.couponCode in COUPONS) || isCouponExpired(cart.couponCode))) {
      changes.push({ type: 'coupon', message: `O cupom ${cart.couponCode} expirou e o desconto foi removido.` })
      cart.couponCode = null
      saveCart(owner, cart)
      current = buildCart(cart)
    }

    for (const item of current.items) {
      const seen = input.reviewed?.prices?.[item.id]
      if (seen !== undefined && seen !== item.unitPrice) {
        changes.push({ type: 'price', nftId: item.nftId, message: `${item.name}: o preço mudou de ${seen} para ${item.unitPrice} ETH.` })
      }
    }

    if (input.reviewed?.total !== current.quote.total) {
      if (!changes.length) changes.push({ type: 'fee', message: 'O total do pedido mudou (desconto ou taxa de rede).' })
      return error(409, 'quote_changed', 'Os valores do pedido mudaram. Revise o resumo e confirme novamente.', {
        quote: current.quote,
        changes,
      })
    }

    const scenario = getScenario().orders ?? {}
    const outcome = scenario.outcome ?? 'confirmed'
    const order: Order = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      version: 1,
      status: outcome,
      createdAt: new Date().toISOString(),
      transactionRef: `0x${crypto.randomUUID().replaceAll('-', '')}`,
      items: current.items.map((item) => ({
        nftId: item.nftId,
        name: item.name,
        tokenId: item.tokenId,
        imageUrl: item.imageUrl,
        imageAlt: item.imageAlt,
        editionLabel: item.edition.label,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      quote: current.quote,
      collector: input.collector,
      wallet: input.wallet,
    }

    db.orders[order.id] = order
    db.owners[order.id] = auth.user.id
    db.keys[key] = { body: rawBody, orderId: order.id }
    if (outcome === 'pending') {
      db.settle = { ...db.settle, [order.id]: { at: Date.now() + (scenario.settleAfterMs ?? 3000), to: scenario.settleTo ?? 'confirmed' } }
    }
    saveOrders(db)
    if (outcome === 'pending') scheduleSettle(order.id)

    if (outcome === 'confirmed') saveCart(owner, { lines: [], couponCode: null })

    if (timeoutsServed < (scenario.responseTimeouts ?? 0)) {
      timeoutsServed += 1
      await delay('infinite')
    }

    return HttpResponse.json(order, { status: 201 })
  }),

  http.get('/api/orders/:id', async ({ params, request }) => {
    await delay(250)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    const id = params.id as string
    settleIfDue(id)
    const db = loadOrders()
    if (!db.orders[id]) return error(404, 'not_found', 'Pedido não encontrado.')
    if (db.owners[id] !== auth.user.id) return error(403, 'forbidden', 'Você não tem acesso a este pedido.')
    return HttpResponse.json(db.orders[id])
  }),
]
