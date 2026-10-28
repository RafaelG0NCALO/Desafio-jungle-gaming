import Decimal from 'decimal.js'
import type { Cart, CartItem } from '@/api/cart'
import { detailOf, findNft, isCouponExpired } from './catalogStore'

interface StoredLine {
  id: string
  nftId: string
  editionId: string
  quantity: number
}

export interface StoredCart {
  lines: StoredLine[]
  couponCode: string | null
}

const STORAGE_KEY = 'kurio.mock.cart'

const SEED: StoredCart = {
  couponCode: null,
  lines: [
    { id: 'line-seed-1', nftId: 'nft-001', editionId: 'open', quantity: 2 },
    { id: 'line-seed-2', nftId: 'nft-005', editionId: 'open', quantity: 6 },
    { id: 'line-seed-3', nftId: 'nft-006', editionId: 'open', quantity: 9 },
  ],
}

export const COUPONS = {
  KURIO10: { percent: 10 },
} as const
export const EXPIRED_COUPONS = ['EXPIRADO'] as const

export type CouponCheck =
  | { status: 'none'; code: null }
  | { status: 'valid'; code: string }
  | { status: 'invalid' | 'expired'; code: string; message: string }

export function checkCoupon(code: string | null | undefined): CouponCheck {
  const normalized = (code ?? '').trim().toUpperCase()
  if (!normalized) return { status: 'none', code: null }
  if ((EXPIRED_COUPONS as readonly string[]).includes(normalized) || isCouponExpired(normalized)) {
    return { status: 'expired', code: normalized, message: 'Este cupom expirou.' }
  }
  if (!(normalized in COUPONS)) return { status: 'invalid', code: normalized, message: 'Cupom inválido.' }
  return { status: 'valid', code: normalized }
}

const NETWORK_FEE = new Decimal('0.016')

type CartDb = Record<string, StoredCart>

function loadAll(): CartDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CartDb
  } catch {
  }
  return {}
}

const isVisitor = (owner: string) => owner.startsWith('v:')

export function loadCart(owner: string): StoredCart {
  const stored = loadAll()[owner]
  if (stored) return stored
  return isVisitor(owner) ? structuredClone(SEED) : { lines: [], couponCode: null }
}

export function saveCart(owner: string, cart: StoredCart) {
  try {
    const db = loadAll()
    db[owner] = cart
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
  }
}

export function resetCart() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
  }
}

export function mergeCarts(userOwner: string, visitorOwner: string): StoredCart {
  const user = loadCart(userOwner)
  const visitor = loadCart(visitorOwner)
  for (const line of visitor.lines) {
    const existing = user.lines.find((l) => l.nftId === line.nftId && l.editionId === line.editionId)
    const max = maxQuantityFor(line.nftId, line.editionId)
    if (existing) existing.quantity = Math.min(existing.quantity + line.quantity, max)
    else if (max > 0) user.lines.push({ ...line, quantity: Math.min(line.quantity, max) })
  }
  user.couponCode = user.couponCode ?? visitor.couponCode
  saveCart(userOwner, user)
  saveCart(visitorOwner, { lines: [], couponCode: null })
  return user
}

export function maxQuantityFor(nftId: string, editionId: string) {
  const nft = findNft(nftId)
  const edition = nft && detailOf(nft).editions.find((e) => e.id === editionId)
  if (!edition) return 0
  return edition.available === null ? edition.maxPerOrder : Math.min(edition.maxPerOrder, edition.available)
}

const eth = (value: Decimal) => value.toString()

export function buildCart(stored: StoredCart): Cart {
  const items: CartItem[] = stored.lines.flatMap((line) => {
    const nft = findNft(line.nftId)
    if (!nft) return []
    const detail = detailOf(nft)
    const edition = detail.editions.find((e) => e.id === line.editionId)
    if (!edition) return []
    return [
      {
        id: line.id,
        nftId: nft.id,
        name: nft.name,
        imageUrl: nft.imageUrl,
        imageAlt: nft.imageAlt,
        tokenId: detail.tokenId,
        edition: { id: edition.id, label: edition.label },
        unitPrice: nft.price,
        quantity: line.quantity,
        lineTotal: eth(new Decimal(nft.price).times(line.quantity)),
        maxQuantity: maxQuantityFor(nft.id, edition.id),
      },
    ]
  })

  const subtotal = items.reduce((sum, item) => sum.plus(item.lineTotal), new Decimal(0))
  const validCoupon = stored.couponCode && stored.couponCode in COUPONS && !isCouponExpired(stored.couponCode)
  const percent = validCoupon ? COUPONS[stored.couponCode as keyof typeof COUPONS].percent : 0
  const discount = subtotal.times(percent).div(100)
  const fee = items.length ? NETWORK_FEE : new Decimal(0)

  return {
    items,
    couponCode: stored.couponCode,
    quote: {
      subtotal: eth(subtotal),
      discount: eth(discount),
      discountLabel: 'Desconto do lançamento',
      networkFee: eth(fee),
      feeEstimated: true,
      total: eth(subtotal.minus(discount).plus(fee)),
      currency: 'ETH',
    },
  }
}
