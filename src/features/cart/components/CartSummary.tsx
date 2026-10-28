import { Link } from '@tanstack/react-router'
import type { Cart } from '@/api/cart'
import { CouponForm } from './CouponForm'
import { QuoteBreakdown } from './QuoteBreakdown'

export function CartSummary({ cart, isPending }: { cart?: Cart; isPending: boolean }) {
  const quote = cart?.quote
  const empty = !cart || cart.items.length === 0

  return (
    <aside
      aria-labelledby="summary-title"
      aria-busy={isPending}
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-4 rounded-t-3xl bg-surface px-5 pt-5 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] lg:static lg:gap-5 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none"
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 lg:max-w-none lg:gap-5">
      <h2 id="summary-title" className="sr-only text-base font-bold lg:not-sr-only">
        Resumo da carteira
      </h2>

      {isPending || !quote ? (
        <div aria-hidden className="flex flex-col gap-4">
          <div className="skeleton h-9 rounded-md" />
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-4 rounded" />
          ))}
          <div className="skeleton h-10 rounded-md" />
        </div>
      ) : (
        <>
          <CouponForm appliedCode={cart.couponCode} />

          <div className="lg:border-t lg:border-nav-accent/30 lg:pt-4">
            <QuoteBreakdown quote={quote} />
          </div>

          {empty ? (
            <button
              type="button"
              disabled
              className="h-14 cursor-not-allowed rounded-full bg-nav-accent text-base font-bold text-background opacity-40 lg:h-10 lg:rounded-md lg:text-sm"
            >
              Conectar e finalizar
            </button>
          ) : (
            <Link
              to="/pagamento"
              className="grid h-14 place-items-center rounded-full bg-linear-to-r from-nav-active to-nav-accent text-base font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active lg:h-10 lg:rounded-md lg:bg-none lg:bg-nav-accent lg:text-sm"
            >
              Conectar e finalizar
            </Link>
          )}

          <Link
            to="/mercado"
            className="hidden self-center rounded-sm text-xs text-nav-active hover:underline lg:block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
          >
            Continuar explorando
          </Link>
        </>
      )}
      </div>
    </aside>
  )
}
