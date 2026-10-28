import { delay, http, HttpResponse } from 'msw'
import Decimal from 'decimal.js'
import type { Nft, NftFacets, NftListResponse, NftSort, NftTab } from '@/api/nfts'
import { COLLECTIONS, NETWORKS, PRICE_BOUNDS } from '@/features/catalog/search'
import { resolveOwner } from '../db/authStore'
import { loadCart } from '../db/cartStore'
import { getScenario } from '../scenarios/engine'
import { allNfts, detailOf, findNft } from '../db/catalogStore'
import { buildReviews, FEATURED_NFT_ID } from '../fixtures/nfts'

const RELATED_LIMIT = 15
const NEW_WINDOW = 12
const TRENDING_MIN_LIKES = 200

const SORTERS: Record<NftSort, (a: Nft, b: Nft) => number> = {
  recent: (a, b) => b.listedAt.localeCompare(a.listedAt),
  'price-asc': (a, b) => new Decimal(a.price).comparedTo(b.price),
  'price-desc': (a, b) => new Decimal(b.price).comparedTo(a.price),
  likes: (a, b) => b.likes - a.likes,
}

function facets(): NftFacets {
  const count = (key: 'collection' | 'network', values: readonly { value: string }[]) =>
    Object.fromEntries(values.map((v) => [v.value, allNfts().filter((n) => n[key] === v.value).length]))
  return {
    collections: count('collection', COLLECTIONS),
    networks: count('network', NETWORKS),
    price: { min: PRICE_BOUNDS.min, max: PRICE_BOUNDS.max },
  }
}

export const nftHandlers = [
  http.get('/api/nfts/featured', async () => {
    await delay(200)
    return HttpResponse.json(findNft(FEATURED_NFT_ID))
  }),

  http.get('/api/nfts/also-viewed', async ({ request }) => {
    await delay(300)
    const { owner } = await resolveOwner(request)
    const inCart = new Set(loadCart(owner).lines.map((l) => l.nftId))
    return HttpResponse.json({ items: allNfts().filter((n) => !inCart.has(n.id)).slice(0, RELATED_LIMIT) })
  }),

  http.get('/api/nfts/:id/related', async ({ params }) => {
    await delay(300)
    if (!findNft(params.id as string)) {
      return HttpResponse.json({ code: 'not_found', message: 'NFT não encontrado.' }, { status: 404 })
    }
    return HttpResponse.json({ items: allNfts().filter((n) => n.id !== params.id).slice(0, RELATED_LIMIT) })
  }),

  http.get('/api/nfts/:id/reviews', async ({ params }) => {
    await delay(300)
    const nft = findNft(params.id as string)
    if (!nft) {
      return HttpResponse.json({ code: 'not_found', message: 'NFT não encontrado.' }, { status: 404 })
    }
    const items = buildReviews(nft)
    return HttpResponse.json({ items, total: items.length })
  }),

  http.get('/api/nfts/:id', async ({ params }) => {
    await delay(300)
    const nft = findNft(params.id as string)
    if (!nft) {
      return HttpResponse.json({ code: 'not_found', message: 'NFT não encontrado.' }, { status: 404 })
    }
    return HttpResponse.json(detailOf(nft))
  }),

  http.get('/api/nfts', async ({ request }) => {
    const q = new URL(request.url).searchParams
    const tab = (q.get('tab') ?? 'all') as NftTab
    const sort = (q.get('sort') ?? 'recent') as NftSort
    const page = Math.max(1, Number(q.get('page') ?? 1))
    const pageSize = Math.min(48, Math.max(1, Number(q.get('pageSize') ?? 9)))
    const collections = q.getAll('collections')
    const networks = q.getAll('networks')
    const text = q.get('q')?.trim().toLowerCase()
    const min = q.get('min')
    const max = q.get('max')

    await delay(300)

    const catalog = allNfts()
    let items = catalog.filter(
      (n) =>
        (!text || n.name.toLowerCase().includes(text)) &&
        (!collections.length || collections.includes(n.collection)) &&
        (!networks.length || networks.includes(n.network)) &&
        (!min || new Decimal(n.price).gte(min)) &&
        (!max || new Decimal(n.price).lte(max)),
    )
    if (tab === 'new') items = items.filter((n) => catalog.findIndex((c) => c.id === n.id) < NEW_WINDOW)
    if (tab === 'trending') items = items.filter((n) => n.likes >= TRENDING_MIN_LIKES)
    items = [...items].sort(SORTERS[sort] ?? SORTERS.recent)
    if (getScenario().catalogEmpty) items = []

    const total = items.length
    const body: NftListResponse = {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      facets: facets(),
    }
    return HttpResponse.json(body)
  }),
]
