import { delay, http, HttpResponse } from 'msw'
import type { AddCartItemInput } from '@/api/cart'
import { authenticate, resolveOwner } from '../db/authStore'
import { buildCart, checkCoupon, loadCart, maxQuantityFor, mergeCarts, saveCart } from '../db/cartStore'
import { detailOf, findNft } from '../db/catalogStore'

const error = (status: number, code: string, message: string) => HttpResponse.json({ code, message }, { status })

const limitMessage = (max: number) =>
  max === 0 ? 'Esta edição está esgotada.' : `Só é possível comprar até ${max} ${max === 1 ? 'unidade' : 'unidades'} desta edição.`

export const cartHandlers = [
  http.get('/api/cart', async ({ request }) => {
    await delay(250)
    const { owner } = await resolveOwner(request)
    return HttpResponse.json(buildCart(loadCart(owner)))
  }),

  http.post('/api/cart/items', async ({ request }) => {
    await delay(250)
    const body = (await request.json()) as Partial<AddCartItemInput>
    const quantity = Number(body.quantity)
    if (!body.nftId || !body.editionId || !Number.isInteger(quantity) || quantity < 1) {
      return error(422, 'validation_error', 'Informe o NFT, a edição e uma quantidade inteira maior que zero.')
    }
    const nft = findNft(body.nftId)
    if (!nft || !detailOf(nft).editions.some((e) => e.id === body.editionId)) {
      return error(404, 'not_found', 'NFT ou edição não encontrados.')
    }

    const { owner } = await resolveOwner(request)
    const cart = loadCart(owner)
    const existing = cart.lines.find((l) => l.nftId === body.nftId && l.editionId === body.editionId)
    const max = maxQuantityFor(body.nftId, body.editionId)
    const next = (existing?.quantity ?? 0) + quantity
    if (next > max) return error(409, 'availability_conflict', limitMessage(max))

    if (existing) existing.quantity = next
    else cart.lines.push({ id: `line-${crypto.randomUUID()}`, nftId: body.nftId, editionId: body.editionId, quantity })
    saveCart(owner, cart)
    return HttpResponse.json(buildCart(cart))
  }),

  http.patch('/api/cart/items/:id', async ({ params, request }) => {
    await delay(250)
    const { quantity } = (await request.json()) as { quantity?: number }
    if (!Number.isInteger(quantity) || (quantity as number) < 1) {
      return error(422, 'validation_error', 'A quantidade deve ser um inteiro maior que zero.')
    }
    const { owner } = await resolveOwner(request)
    const cart = loadCart(owner)
    const line = cart.lines.find((l) => l.id === params.id)
    if (!line) return error(404, 'not_found', 'Item não encontrado no carrinho.')
    const max = maxQuantityFor(line.nftId, line.editionId)
    if ((quantity as number) > max && (quantity as number) >= line.quantity) return error(409, 'availability_conflict', limitMessage(max))
    line.quantity = quantity as number
    saveCart(owner, cart)
    return HttpResponse.json(buildCart(cart))
  }),

  http.delete('/api/cart/items/:id', async ({ params, request }) => {
    await delay(250)
    const { owner } = await resolveOwner(request)
    const cart = loadCart(owner)
    if (!cart.lines.some((l) => l.id === params.id)) return error(404, 'not_found', 'Item não encontrado no carrinho.')
    cart.lines = cart.lines.filter((l) => l.id !== params.id)
    if (!cart.lines.length) cart.couponCode = null
    saveCart(owner, cart)
    return HttpResponse.json(buildCart(cart))
  }),

  http.post('/api/cart/coupon', async ({ request }) => {
    await delay(250)
    const { code } = (await request.json()) as { code?: string }
    const coupon = checkCoupon(code)
    if (coupon.status === 'none') return error(422, 'validation_error', 'Digite o código promocional.')
    if (coupon.status === 'expired') return error(422, 'coupon_expired', coupon.message)
    if (coupon.status === 'invalid') return error(422, 'coupon_invalid', coupon.message)
    const { owner } = await resolveOwner(request)
    const cart = loadCart(owner)
    cart.couponCode = coupon.code
    saveCart(owner, cart)
    return HttpResponse.json(buildCart(cart))
  }),

  http.delete('/api/cart/coupon', async ({ request }) => {
    await delay(150)
    const { owner } = await resolveOwner(request)
    const cart = loadCart(owner)
    cart.couponCode = null
    saveCart(owner, cart)
    return HttpResponse.json(buildCart(cart))
  }),

  http.post('/api/cart/merge', async ({ request }) => {
    await delay(250)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    const visitorId = request.headers.get('X-Visitor-Id')
    const merged = visitorId ? mergeCarts(`u:${auth.user.id}`, `v:${visitorId}`) : loadCart(`u:${auth.user.id}`)
    return HttpResponse.json(buildCart(merged))
  }),
]
