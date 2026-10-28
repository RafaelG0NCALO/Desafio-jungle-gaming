import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import Decimal from 'decimal.js'
import {
  addCartItem,
  applyCoupon,
  fetchCart,
  removeCartItem,
  removeCoupon,
  updateCartItem,
  type Cart,
} from '@/api/cart'
import { CouponRejected, fetchQuote } from '@/api/quote'
import { useOwner, useSession } from '@/features/auth/session'
import { nftKeys } from '@/features/catalog/hooks'

export const cartKeys = {
  all: ['cart'] as const,
  of: (owner: string) => ['cart', owner] as const,
}

const retryTransient = (count: number, error: unknown) =>
  count < 2 && !(isAxiosError(error) && error.response && error.response.status < 500)

export function useCartKey() {
  return cartKeys.of(useOwner())
}

export function useCart() {
  const session = useSession()
  return useQuery({
    queryKey: cartKeys.of(session.data?.id ?? 'visitor'),
    queryFn: ({ signal }) => fetchCart(signal),
    enabled: !session.isPending,
    staleTime: 10_000,
    retry: retryTransient,
  })
}

export function useCartCount() {
  const { data } = useCart()
  return data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

function useCartCache() {
  const queryClient = useQueryClient()
  const key = useCartKey()
  return (cart: Cart) => queryClient.setQueryData(key, cart)
}

function useRefreshSuggestions() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: [...nftKeys.all, 'also-viewed'] })
}

export function useAddToCart() {
  const setCart = useCartCache()
  const refreshSuggestions = useRefreshSuggestions()
  return useMutation({
    mutationFn: addCartItem,
    onSuccess: (cart) => {
      setCart(cart)
      refreshSuggestions()
    },
  })
}

export function useUpdateQuantity() {
  const queryClient = useQueryClient()
  const key = useCartKey()
  const setCart = useCartCache()

  const mutationKey = [...cartKeys.all, 'update-quantity']
  const isLast = () => queryClient.isMutating({ mutationKey }) <= 1

  return useMutation({
    mutationKey,
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => updateCartItem(id, quantity),
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Cart>(key)
      if (previous) {
        queryClient.setQueryData<Cart>(key, {
          ...previous,
          items: previous.items.map((item) =>
            item.id === id
              ? { ...item, quantity, lineTotal: new Decimal(item.unitPrice).times(quantity).toString() }
              : item,
          ),
        })
      }
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSuccess: (cart) => {
      if (isLast()) setCart(cart)
    },
    onSettled: () => {
      if (isLast()) return queryClient.invalidateQueries({ queryKey: key })
    },
  })
}

export function useRemoveItem() {
  const setCart = useCartCache()
  const refreshSuggestions = useRefreshSuggestions()
  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: (cart) => {
      setCart(cart)
      refreshSuggestions()
    },
  })
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: async (code: string) => {
      const { coupon } = await fetchQuote(code)
      if (coupon.status !== 'valid') throw new CouponRejected(coupon.message ?? 'Cupom inválido.')
      return applyCoupon(code)
    },
    onSuccess: useCartCache(),
  })
}

export function useRemoveCoupon() {
  return useMutation({ mutationFn: removeCoupon, onSuccess: useCartCache() })
}
