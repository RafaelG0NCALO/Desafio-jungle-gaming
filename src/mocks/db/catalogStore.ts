import type { Nft, NftDetail } from '@/api/nfts'
import { buildNftDetail, NFT_FIXTURES } from '../fixtures/nfts'

export interface NftOverride {
  price?: string
  previousPrice?: string | null
  availability?: Record<string, number | null>
  version: number
}

interface LiveDb {
  nfts: Record<string, NftOverride>
  expiredCoupons: string[]
}

const STORAGE_KEY = 'kurio.mock.catalog'

function load(): LiveDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const db = JSON.parse(raw) as Partial<LiveDb>
      return { nfts: db.nfts ?? {}, expiredCoupons: db.expiredCoupons ?? [] }
    }
  } catch {
  }
  return { nfts: {}, expiredCoupons: [] }
}

function save(db: LiveDb) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
  }
}

export function resetCatalog() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
  }
}

function withOverride(nft: Nft, override?: NftOverride): Nft {
  if (!override) return nft
  return {
    ...nft,
    price: override.price ?? nft.price,
    previousPrice: override.previousPrice !== undefined ? override.previousPrice : nft.previousPrice,
    version: override.version,
  }
}

export function allNfts(): Nft[] {
  const { nfts } = load()
  return NFT_FIXTURES.map((nft) => withOverride(nft, nfts[nft.id]))
}

export function findNft(id: string): Nft | undefined {
  const base = NFT_FIXTURES.find((n) => n.id === id)
  return base && withOverride(base, load().nfts[id])
}

export function detailOf(nft: Nft): NftDetail {
  const override = load().nfts[nft.id]
  const detail = buildNftDetail(nft)
  return {
    ...detail,
    ...withOverride(nft, override),
    editions: detail.editions.map((edition) => {
      const available = override?.availability?.[edition.id]
      return available === undefined ? edition : { ...edition, available }
    }),
  }
}

export function updateNft(id: string, patch: Pick<NftOverride, 'price' | 'previousPrice' | 'availability'>): Nft {
  if (!NFT_FIXTURES.some((n) => n.id === id)) throw new Error(`NFT desconhecido: ${id}`)
  const db = load()
  const current = db.nfts[id]
  db.nfts[id] = {
    ...current,
    ...patch,
    availability: { ...current?.availability, ...patch.availability },
    version: (current?.version ?? 1) + 1,
  }
  save(db)
  return findNft(id)!
}

export const isCouponExpired = (code: string) => load().expiredCoupons.includes(code.toUpperCase())

export function expireCoupon(code: string) {
  const db = load()
  const normalized = code.toUpperCase()
  if (!db.expiredCoupons.includes(normalized)) db.expiredCoupons.push(normalized)
  save(db)
}
