import { delay, http, HttpResponse } from 'msw'
import type { QuoteResponse } from '@/api/quote'
import { resolveOwner } from '../db/authStore'
import { buildCart, checkCoupon, loadCart } from '../db/cartStore'

export const quoteHandlers = [
  http.post('/api/quote', async ({ request }) => {
    await delay(250)
    const body = (await request.json().catch(() => ({}))) as { couponCode?: string | null }
    const { owner } = await resolveOwner(request)
    const stored = loadCart(owner)

    const requested = 'couponCode' in body ? body.couponCode : stored.couponCode
    const check = checkCoupon(requested)
    const cart = buildCart({ ...stored, couponCode: check.status === 'valid' ? check.code : null })

    const items = cart.items.map((item) => ({
      id: item.id,
      nftId: item.nftId,
      name: item.name,
      edition: item.edition,
      quantity: item.quantity,
      maxQuantity: item.maxQuantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      available: item.quantity <= item.maxQuantity,
    }))

    const response: QuoteResponse = {
      quote: cart.quote,
      coupon: check.status === 'none' ? { code: null, status: 'none' } : { code: check.code, status: check.status, ...('message' in check ? { message: check.message } : {}) },
      items,
      available: items.every((item) => item.available),
    }
    return HttpResponse.json(response)
  }),
]
