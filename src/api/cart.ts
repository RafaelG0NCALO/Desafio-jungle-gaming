import { isAxiosError } from 'axios'
import { http } from './http'

export interface CartItem {
  id: string
  nftId: string
  name: string
  imageUrl: string
  imageAlt: string
  tokenId: string
  edition: { id: string; label: string }
  unitPrice: string
  quantity: number
  lineTotal: string
  maxQuantity: number
}

export interface CartQuote {
  subtotal: string
  discount: string
  discountLabel: string
  networkFee: string
  feeEstimated: boolean
  total: string
  currency: 'ETH'
}

export interface Cart {
  items: CartItem[]
  couponCode: string | null
  quote: CartQuote
}

export interface AddCartItemInput {
  nftId: string
  editionId: string
  quantity: number
}

export interface ApiErrorBody {
  code: string
  message: string
}

export function apiErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError<ApiErrorBody>(error)) return fallback
  if (!error.response) {
    return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      ? 'A requisição demorou demais. Tente novamente.'
      : 'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
  }
  if (error.response.status >= 500) return 'Serviço temporariamente indisponível. Tente novamente em instantes.'
  return error.response.data?.message ?? fallback
}

export async function fetchCart(signal?: AbortSignal): Promise<Cart> {
  const { data } = await http.get<Cart>('/cart', { signal })
  return data
}

export async function addCartItem(input: AddCartItemInput): Promise<Cart> {
  const { data } = await http.post<Cart>('/cart/items', input)
  return data
}

export async function updateCartItem(id: string, quantity: number): Promise<Cart> {
  const { data } = await http.patch<Cart>(`/cart/items/${encodeURIComponent(id)}`, { quantity })
  return data
}

export async function removeCartItem(id: string): Promise<Cart> {
  const { data } = await http.delete<Cart>(`/cart/items/${encodeURIComponent(id)}`)
  return data
}

export async function applyCoupon(code: string): Promise<Cart> {
  const { data } = await http.post<Cart>('/cart/coupon', { code })
  return data
}

export async function removeCoupon(): Promise<Cart> {
  const { data } = await http.delete<Cart>('/cart/coupon')
  return data
}

export async function mergeVisitorCart(): Promise<Cart> {
  const { data } = await http.post<Cart>('/cart/merge')
  return data
}
