import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { fetchConnectedWallets, fetchWallets, saveWallet, setSecondarySameAsPrimary, type WalletInput, type WalletKind, type WalletsResponse } from '@/api/wallets'
import { useOwner } from '@/features/auth/session'

export const walletKeys = {
  of: (owner: string) => ['wallets', owner] as const,
  connected: (owner: string) => ['wallets', owner, 'connected'] as const,
}

const retryTransient = (count: number, error: unknown) =>
  count < 2 && !(isAxiosError(error) && error.response && error.response.status < 500)

export function useWallets() {
  const owner = useOwner()
  return useQuery({
    queryKey: walletKeys.of(owner),
    queryFn: ({ signal }) => fetchWallets(signal),
    staleTime: 60_000,
    retry: retryTransient,
  })
}

export function useCheckoutWallets() {
  const owner = useOwner()
  const connected = useQuery({
    queryKey: walletKeys.connected(owner),
    queryFn: ({ signal }) => fetchConnectedWallets(signal),
    staleTime: 60_000,
    retry: retryTransient,
  })
  const registered = useWallets()
  const items = connected.data
    ? [...connected.data.items, ...(registered.data?.items ?? []).filter((r) => !connected.data.items.some((c) => c.address === r.address))]
    : undefined
  return {
    items,
    isPending: connected.isPending,
    isError: connected.isError,
    refetch: () => connected.refetch(),
  }
}

function useWalletsCache() {
  const queryClient = useQueryClient()
  const owner = useOwner()
  return (data: WalletsResponse) => queryClient.setQueryData(walletKeys.of(owner), data)
}

export function useSaveWallet(kind: WalletKind) {
  return useMutation({ mutationFn: (input: WalletInput) => saveWallet(kind, input), onSuccess: useWalletsCache() })
}

export function useSecondarySameAsPrimary() {
  return useMutation({ mutationFn: setSecondarySameAsPrimary, onSuccess: useWalletsCache() })
}
