import { useState } from 'react'
import { apiErrorMessage } from '@/api/cart'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { MobilePageBar } from '@/components/layout/MobilePageBar'
import { LiveNotices } from '@/features/realtime/LiveNotices'
import { AlsoViewedNfts } from './components/AlsoViewedNfts'
import { CartEmpty, CartLoadError } from './components/CartStates'
import { CartSummary } from './components/CartSummary'
import { CartTable } from './components/CartTable'
import { useCart, useRemoveItem, useUpdateQuantity } from './hooks'

export function CartSection() {
  const cart = useCart()
  const update = useUpdateQuantity()
  const remove = useRemoveItem()
  const [message, setMessage] = useState('')

  const changeQuantity = (id: string, quantity: number) => {
    setMessage('')
    update.mutate(
      { id, quantity },
      { onError: (error) => setMessage(apiErrorMessage(error, 'Não foi possível atualizar a quantidade. Tente novamente.')) },
    )
  }

  const removeItem = (id: string) => {
    setMessage('')
    remove.mutate(id, {
      onError: (error) => setMessage(apiErrorMessage(error, 'Não foi possível remover o item. Tente novamente.')),
    })
  }

  let main
  if (cart.isError && !cart.data) {
    main = <CartLoadError onRetry={() => cart.refetch()} />
  } else if (cart.data && cart.data.items.length === 0) {
    main = <CartEmpty />
  } else {
    main = (
      <CartTable
        items={cart.data?.items}
        isPending={cart.isPending}
        removingId={remove.isPending ? remove.variables : undefined}
        onQuantityChange={changeQuantity}
        onRemove={removeItem}
      />
    )
  }

  return (
    <>
      <MobilePageBar backFallback="/mercado" title="Carrinho de NFTs" />
      <section aria-labelledby="cart-title" className="mx-auto max-w-360 px-4 pb-8 md:px-8 lg:px-16 lg:py-8">
        <div className="hidden lg:block">
          <Breadcrumb
            items={[
              { label: 'Início', to: '/' },
              { label: 'Mercado', to: '/mercado' },
              { label: 'Carrinho', to: '/carrinho' },
            ]}
          />
        </div>
        <h1 id="cart-title" className="sr-only">
          Carrinho de NFTs
        </h1>

        {message && (
          <p role="alert" className="mb-4 rounded-md border border-nav-active/60 bg-surface px-4 py-3 text-sm text-nav-active">
            {message}
          </p>
        )}

        <LiveNotices scopes={['cart', 'connection']} />

        <div className="grid gap-8 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="min-w-0">{main}</div>
          <CartSummary cart={cart.data} isPending={cart.isPending} />
        </div>

        <div className="mt-10 lg:mt-12">
          <AlsoViewedNfts />
        </div>
      </section>
    </>
  )
}
