import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import type { Cart } from '@/api/cart'
import { formatEth } from '@/lib/eth'
import { CouponForm } from '@/features/cart/components/CouponForm'
import { QuoteBreakdown } from '@/features/cart/components/QuoteBreakdown'
import type { WalletChoice } from '@/features/wallets/connection'
import { WalletConnectionStatus } from './WalletConnectionStatus'
import { WalletProviderList } from './WalletProviderList'
import { WalletRadioGroup } from './WalletRadioGroup'

interface OrderSummaryProps {
  cart?: Cart
  isPending: boolean
  walletType: string
  onWalletChange: (value: string) => void
  formId: string
  submitting: boolean
  message: string
  changes: string[]
  needsCartFix: boolean
  walletChoice: WalletChoice
  walletsSlot?: ReactNode
}

export function OrderSummary({
  cart,
  isPending,
  walletType,
  onWalletChange,
  formId,
  submitting,
  message,
  changes,
  needsCartFix,
  walletChoice,
  walletsSlot,
}: OrderSummaryProps) {
  const [couponOpen, setCouponOpen] = useState(false)

  return (
    <aside aria-labelledby="order-title" aria-busy={isPending} className="flex flex-col gap-5">
      {walletsSlot}

      <h2 id="order-title" className="sr-only text-base font-bold lg:not-sr-only">
        Seus NFTs
      </h2>

      {isPending || !cart ? (
        <div aria-hidden className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-14 rounded-md" />
          ))}
          <div className="skeleton h-24 rounded-md" />
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <div aria-hidden className="mb-2 flex justify-between border-b border-nav-accent/40 pb-2 text-xs font-bold">
              <span>NFTs</span>
              <span>Subtotal</span>
            </div>
            <ul aria-label="Itens do pedido" className="flex flex-col gap-2">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-md bg-surface p-2">
                  <img src={item.imageUrl} alt={item.imageAlt} width={40} height={40} loading="lazy" className="size-10 shrink-0 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{item.name}</p>
                    <p className="text-[10px] text-nav-tab">ID do token: {item.tokenId}</p>
                  </div>
                  <p className="text-[11px] text-nav-tab">
                    <span className="sr-only">Quantidade: </span>(x {item.quantity})
                  </p>
                  <p className="text-sm font-bold text-nav-active">{formatEth(item.lineTotal)} ETH</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden text-center text-xs lg:block">
            <p>
              Tem um código promocional?{' '}
              <button
                type="button"
                aria-expanded={couponOpen}
                aria-controls="checkout-coupon"
                onClick={() => setCouponOpen((v) => !v)}
                className="rounded-sm text-nav-active underline focus-visible:outline-2 focus-visible:outline-nav-active"
              >
                Aplique aqui
              </button>
            </p>
            {couponOpen && (
              <div id="checkout-coupon" className="mt-3 text-left">
                <CouponForm appliedCode={cart.couponCode} />
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <QuoteBreakdown quote={cart.quote} />
          </div>

          <WalletRadioGroup value={walletType} onChange={onWalletChange} />
          <WalletProviderList value={walletType} onChange={onWalletChange} />

          <WalletConnectionStatus choice={walletChoice} />

          <p className="flex items-baseline justify-end gap-3 lg:hidden">
            <span className="text-sm font-bold">Total:</span>
            <span className="text-xl font-bold text-nav-active">{formatEth(cart.quote.total)} ETH</span>
          </p>

          <div
            role="status"
            aria-live="polite"
            className={message ? 'rounded-md border border-nav-active/60 bg-surface px-3 py-2 text-xs text-nav-active' : 'sr-only'}
          >
            {message}
            {changes.length > 0 && (
              <ul className="mt-2 list-disc pl-4">
                {changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            )}
            {needsCartFix && (
              <Link to="/carrinho" className="mt-2 inline-block rounded-sm font-bold underline focus-visible:outline-2 focus-visible:outline-nav-active">
                Ajustar no carrinho
              </Link>
            )}
          </div>

          {cart.items.length === 0 ? (
            <Link
              to="/mercado"
              className="grid h-11 place-items-center rounded-md bg-nav-accent text-sm font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
            >
              Ir para o mercado
            </Link>
          ) : (
            <button
              type="submit"
              form={formId}
              disabled={submitting}
              className="fixed inset-x-4 bottom-4 z-40 mx-auto h-14 max-w-xl rounded-full bg-linear-to-r from-nav-active to-nav-accent text-base font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:cursor-not-allowed disabled:opacity-60 lg:static lg:mx-0 lg:h-11 lg:max-w-none lg:rounded-md lg:bg-none lg:bg-nav-accent lg:text-sm"
            >
              {submitting ? 'Enviando pedido…' : 'Confirmar compra'}
            </button>
          )}
        </>
      )}
    </aside>
  )
}
