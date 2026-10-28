import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { fetchOrder } from '@/api/orders'
import { useOwner } from '@/features/auth/session'
import { useRealtimeConnected } from '@/features/realtime/store'

export const orderKeys = { detail: (owner: string, id: string) => ['orders', owner, id] as const }

export function useOrder(id: string) {
  const owner = useOwner()
  const live = useRealtimeConnected()
  return useQuery({
    queryKey: orderKeys.detail(owner, id),
    queryFn: ({ signal }) => fetchOrder(id, signal),
    refetchInterval: (query) => (query.state.data?.status === 'pending' && !live ? 3000 : false),
    staleTime: Infinity,
    retry: (count, error) => count < 2 && !(isAxiosError(error) && error.response && error.response.status < 500),
  })
}

export const isOrderNotFound = (error: unknown) => isAxiosError(error) && error.response?.status === 404

export const isOrderForbidden = (error: unknown) => isAxiosError(error) && error.response?.status === 403
