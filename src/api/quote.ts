import { http } from './http'
import type { CartQuote } from './cart'

export type CouponStatus = 'none' | 'valid' | 'invalid' | 'expired'

export interface QuoteItem {
  id: string
  nftId: string
  name: string
  edition: { id: string; label: string }
  quantity: number
  maxQuantity: number
  unitPrice: string
  lineTotal: string
  available: boolean
}

export interface QuoteResponse {
  quote: CartQuote
  coupon: { code: string | null; status: CouponStatus; message?: string }
  items: QuoteItem[]
  available: boolean
}

export async function fetchQuote(couponCode?: string | null, signal?: AbortSignal): Promise<QuoteResponse> {
  const { data } = await http.post<QuoteResponse>('/quote', couponCode === undefined ? {} : { couponCode }, { signal })
  return data
}

export class CouponRejected extends Error {}
