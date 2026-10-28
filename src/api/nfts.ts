import { http } from './http'

export type NftTab = 'all' | 'new' | 'trending'
export type NftSort = 'recent' | 'price-asc' | 'price-desc' | 'likes'

export type NftBadge = 'rare'

export interface Nft {
  id: string
  version: number
  name: string
  imageUrl: string
  imageAlt: string
  price: string
  previousPrice: string | null
  badge: NftBadge | null
  collection: string
  network: string
  likes: number
  listedAt: string
  edition: { available: number; total: number }
}

export interface NftListParams {
  tab: NftTab
  q?: string
  collections?: string[]
  networks?: string[]
  min?: string
  max?: string
  sort: NftSort
  page: number
  pageSize: number
}

export interface NftFacets {
  collections: Record<string, number>
  networks: Record<string, number>
  price: { min: string; max: string }
}

export interface NftListResponse {
  items: Nft[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  facets: NftFacets
}

export async function fetchNfts(params: NftListParams, signal?: AbortSignal): Promise<NftListResponse> {
  const { data } = await http.get<NftListResponse>('/nfts', {
    params,
    signal,
    paramsSerializer: { indexes: null },
  })
  return data
}

export async function fetchFeaturedNft(signal?: AbortSignal): Promise<Nft> {
  const { data } = await http.get<Nft>('/nfts/featured', { signal })
  return data
}

export interface NftEdition {
  id: string
  label: string
  available: number | null
  maxPerOrder: number
}

export interface NftDetail extends Nft {
  description: string
  gallery: { url: string; alt: string }[]
  editions: NftEdition[]
  defaultEditionId: string
  rating: { average: number; count: number }
  tokenId: string
  collectionName: string
  attributes: string[]
  about: string[]
  technicalDetails: { label: string; text: string }[]
}

export async function fetchNft(id: string, signal?: AbortSignal): Promise<NftDetail> {
  const { data } = await http.get<NftDetail>(`/nfts/${encodeURIComponent(id)}`, { signal })
  return data
}

export interface NftReview {
  id: string
  author: string
  rating: number
  createdAt: string
  comment: string
}

export interface NftReviewsResponse {
  items: NftReview[]
  total: number
}

export async function fetchNftReviews(id: string, signal?: AbortSignal): Promise<NftReviewsResponse> {
  const { data } = await http.get<NftReviewsResponse>(`/nfts/${encodeURIComponent(id)}/reviews`, { signal })
  return data
}

export async function fetchRelatedNfts(id: string, signal?: AbortSignal): Promise<{ items: Nft[] }> {
  const { data } = await http.get<{ items: Nft[] }>(`/nfts/${encodeURIComponent(id)}/related`, { signal })
  return data
}

export async function fetchAlsoViewedNfts(signal?: AbortSignal): Promise<{ items: Nft[] }> {
  const { data } = await http.get<{ items: Nft[] }>('/nfts/also-viewed', { signal })
  return data
}
