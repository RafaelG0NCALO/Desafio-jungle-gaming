import type { Nft } from './nfts'
import { http } from './http'

export interface FavoritesResponse {
  items: Nft[]
}

export async function fetchFavorites(signal?: AbortSignal): Promise<FavoritesResponse> {
  const { data } = await http.get<FavoritesResponse>('/favorites', { signal })
  return data
}

export async function addFavorite(nftId: string): Promise<FavoritesResponse> {
  const { data } = await http.post<FavoritesResponse>('/favorites', { nftId })
  return data
}

export async function removeFavorite(nftId: string): Promise<FavoritesResponse> {
  const { data } = await http.delete<FavoritesResponse>(`/favorites/${encodeURIComponent(nftId)}`)
  return data
}
