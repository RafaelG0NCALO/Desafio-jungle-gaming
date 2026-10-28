import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useNavigate, useRouterState, useSearch } from '@tanstack/react-router'
import { fetchFeaturedNft, fetchNfts, type NftListParams } from '@/api/nfts'
import type { CatalogSearch } from './search'

export const PAGE_SIZE = 9

export const nftKeys = {
  all: ['nfts'] as const,
  list: (params: NftListParams) => [...nftKeys.all, 'list', params] as const,
  featured: () => [...nftKeys.all, 'featured'] as const,
  detail: (id: string) => [...nftKeys.all, 'detail', id] as const,
}

const retryTransient = (failureCount: number, error: unknown) =>
  failureCount < 2 && !(isAxiosError(error) && error.response && error.response.status < 500)

export function toListParams(search: CatalogSearch): NftListParams {
  return {
    tab: search.tab ?? 'all',
    q: search.q,
    collections: search.collections,
    networks: search.networks,
    min: search.min,
    max: search.max,
    sort: search.sort ?? 'recent',
    page: search.page ?? 1,
    pageSize: PAGE_SIZE,
  }
}

export function useNftList(search: CatalogSearch) {
  const params = toListParams(search)
  return useQuery({
    queryKey: nftKeys.list(params),
    queryFn: ({ signal }) => fetchNfts(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: retryTransient,
  })
}

export function useFeaturedNft() {
  return useQuery({
    queryKey: nftKeys.featured(),
    queryFn: ({ signal }) => fetchFeaturedNft(signal),
    staleTime: 60_000,
    retry: retryTransient,
  })
}

export function useCatalogSearch(options?: { to?: '/mercado' }) {
  const search = useSearch({ from: '__root__' })
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const to = options?.to ?? (pathname === '/' || pathname === '/mercado' ? '.' : '/')

  const update = (patch: Partial<CatalogSearch>) =>
    navigate({ to, search: (prev) => ({ ...prev, ...patch, page: undefined }), resetScroll: false })

  const setPage = (page: number) =>
    navigate({ to, search: (prev) => ({ ...prev, page: page > 1 ? page : undefined }), resetScroll: false })

  const clear = () =>
    update({ q: undefined, collections: undefined, networks: undefined, min: undefined, max: undefined, sort: undefined, tab: undefined })

  return { search, update, setPage, clear }
}
