import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { fetchNft } from '@/api/nfts'
import { nftKeys } from '@/features/catalog/hooks'

export function useNftDetail(id: string) {
  return useQuery({
    queryKey: nftKeys.detail(id),
    queryFn: ({ signal }) => fetchNft(id, signal),
    staleTime: 30_000,
    retry: (count, error) => count < 2 && !(isAxiosError(error) && error.response && error.response.status < 500),
  })
}

export const isNotFound = (error: unknown) => isAxiosError(error) && error.response?.status === 404
