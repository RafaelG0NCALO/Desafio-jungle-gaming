import { isAxiosError } from 'axios'
import { http } from './http'
import type { CartQuote } from './cart'

export type OrderStatus = 'pending' | 'confirmed' | 'declined'

export interface OrderItem {
  nftId: string
  name: string
  tokenId: string
  imageUrl: string
  imageAlt: string
  editionLabel: string
  quantity: number
  unitPrice: string
  lineTotal: string
}

export interface CollectorInput {
  displayName: string
  username: string
  profileName: string
  email: string
  referralCode: string
  ensName: string
  note?: string
}

export interface WalletInput {
  type: string
  network: string
  address: string
  secondary?: string
  useOtherWallet: boolean
}

export interface ReviewedQuote {
  total: string
  prices: Record<string, string>
}

export interface CreateOrderInput {
  collector: CollectorInput
  wallet: WalletInput
  reviewed: ReviewedQuote
}

export interface Order {
  id: string
  version?: number
  status: OrderStatus
  createdAt: string
  transactionRef: string
  items: OrderItem[]
  quote: CartQuote
  collector: CollectorInput
  wallet: WalletInput
}

export interface OrderChange {
  type: 'price' | 'availability' | 'coupon' | 'fee'
  nftId?: string
  message: string
}

export interface RevalidationBody {
  code: 'quote_changed' | 'availability_conflict'
  message: string
  quote: CartQuote
  changes: OrderChange[]
}

export const isRevalidation = (error: unknown): error is import('axios').AxiosError<RevalidationBody> =>
  isAxiosError<RevalidationBody>(error) &&
  ['quote_changed', 'availability_conflict'].includes(error.response?.data?.code ?? '')

export const isWalletDisconnected = (error: unknown) =>
  isAxiosError<{ code?: string }>(error) && error.response?.data?.code === 'wallet_disconnected'

export async function createOrder(input: CreateOrderInput, idempotencyKey: string): Promise<Order> {
  const { data } = await http.post<Order>('/orders', input, { headers: { 'Idempotency-Key': idempotencyKey } })
  return data
}

export async function fetchOrder(id: string, signal?: AbortSignal): Promise<Order> {
  const { data } = await http.get<Order>(`/orders/${encodeURIComponent(id)}`, { signal })
  return data
}
