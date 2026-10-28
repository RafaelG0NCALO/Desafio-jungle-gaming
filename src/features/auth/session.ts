import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useNavigate } from '@tanstack/react-router'
import { fetchSession, login, logout, signup, type AuthResponse } from '@/api/auth'
import { mergeVisitorCart } from '@/api/cart'
import { clearToken, getToken, setToken } from '@/lib/session'

export const sessionKey = ['session'] as const

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: sessionKey,
    queryFn: async ({ signal }) => {
      if (!getToken()) return null
      try {
        return (await fetchSession(signal)).user
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          clearToken()
          return null
        }
        throw error
      }
    },
    staleTime: 5 * 60_000,
    retry: (count, error) => count < 2 && !(isAxiosError(error) && error.response && error.response.status < 500),
  })

export function useSession() {
  return useQuery(sessionQueryOptions())
}

export function useOwner() {
  return useSession().data?.id ?? 'visitor'
}

export async function dropSessionData(queryClient: QueryClient) {
  const notSession = (query: { queryKey: readonly unknown[] }) => query.queryKey[0] !== sessionKey[0]
  await queryClient.cancelQueries({ predicate: notSession })
  queryClient.removeQueries({ predicate: notSession })
}

function useStartSession() {
  const queryClient = useQueryClient()
  return async (response: AuthResponse) => {
    setToken(response.token)
    await mergeVisitorCart().catch(() => undefined)
    await dropSessionData(queryClient)
    queryClient.setQueryData(sessionKey, response.user)
  }
}

export function useLogin() {
  const start = useStartSession()
  return useMutation({ mutationFn: login, onSuccess: start })
}

export function useSignup() {
  const start = useStartSession()
  return useMutation({ mutationFn: signup, onSuccess: start })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      clearToken()
      await dropSessionData(queryClient)
      queryClient.setQueryData(sessionKey, null)
      navigate({ to: '/' })
    },
  })
}
