import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { connectWallet, disconnectWallet, fetchConnection, type WalletConnection } from '@/api/walletConnection'
import { useOwner } from '@/features/auth/session'

export const connectionKeys = {
  all: ['wallet-connection'] as const,
  of: (owner: string) => ['wallet-connection', owner] as const,
}

export function useWalletConnection() {
  const owner = useOwner()
  return useQuery({
    queryKey: connectionKeys.of(owner),
    queryFn: ({ signal }) => fetchConnection(signal),
    staleTime: 30_000,
    retry: (count, error) => count < 2 && !(isAxiosError(error) && error.response && error.response.status < 500),
  })
}

export function useConnectWallet() {
  const queryClient = useQueryClient()
  const key = connectionKeys.of(useOwner())
  return useMutation({
    mutationFn: connectWallet,
    onSuccess: (connection) => queryClient.setQueryData(key, connection),
  })
}

export function useDisconnectWallet() {
  const queryClient = useQueryClient()
  const key = connectionKeys.of(useOwner())
  return useMutation({
    mutationFn: disconnectWallet,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<WalletConnection | null>(key)
      queryClient.setQueryData(key, null)
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

export interface WalletChoice {
  provider: string
  network: string
  address: string
}

export function isConnectedTo(connection: WalletConnection | null | undefined, choice: WalletChoice) {
  return (
    !!connection &&
    connection.provider === choice.provider &&
    connection.network === choice.network &&
    connection.address.toLowerCase() === choice.address.trim().toLowerCase()
  )
}
