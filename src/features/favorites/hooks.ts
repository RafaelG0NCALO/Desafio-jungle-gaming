import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { addFavorite, fetchFavorites, removeFavorite, type FavoritesResponse } from '@/api/favorites'
import type { Nft } from '@/api/nfts'
import { useOwner, useSession } from '@/features/auth/session'

export const favoriteKeys = { of: (owner: string) => ['favorites', owner] as const }

export function useFavorites() {
  const session = useSession()
  return useQuery({
    queryKey: favoriteKeys.of(session.data?.id ?? 'visitor'),
    queryFn: ({ signal }) => fetchFavorites(signal),
    enabled: !!session.data,
    staleTime: 60_000,
    retry: (count, error) => count < 2 && !(isAxiosError(error) && error.response && error.response.status < 500),
  })
}

export function useFavorite(nft: Nft) {
  const queryClient = useQueryClient()
  const owner = useOwner()
  const session = useSession()
  const navigate = useNavigate()
  const href = useRouterState({ select: (s) => s.location.href })
  const favorites = useFavorites()
  const [message, setMessage] = useState('')
  const key = favoriteKeys.of(owner)

  const mutation = useMutation({
    mutationFn: ({ add }: { add: boolean }) => (add ? addFavorite(nft.id) : removeFavorite(nft.id)),
    onMutate: async ({ add }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<FavoritesResponse>(key)
      const items = previous?.items ?? []
      queryClient.setQueryData<FavoritesResponse>(key, {
        items: add ? (items.some((n) => n.id === nft.id) ? items : [...items, nft]) : items.filter((n) => n.id !== nft.id),
      })
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      setMessage('Não foi possível atualizar seus favoritos. Tente novamente.')
    },
    onSuccess: (data) => queryClient.setQueryData(key, data),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })

  const isFavorite = !!favorites.data?.items.some((n) => n.id === nft.id)

  const toggle = () => {
    setMessage('')
    if (!session.data) {
      navigate({ to: '.', search: (prev) => ({ ...prev, auth: 'login' as const, redirect: href }), resetScroll: false })
      return
    }
    mutation.mutate({ add: !isFavorite })
  }

  return { isFavorite, toggle, isPending: mutation.isPending, message }
}
