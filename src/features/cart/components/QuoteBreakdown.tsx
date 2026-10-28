import type { ReactNode } from 'react'
import Decimal from 'decimal.js'
import type { CartQuote } from '@/api/cart'
import { formatEth } from '@/lib/eth'

function Row({ label, children, note }: { label: string; children: ReactNode; note?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-sm lg:text-xs">
        <dt className="text-nav-tab">{label}</dt>
        <dd>{children}</dd>
      </div>
      {note && <p className="mt-1 text-right text-[10px] text-nav-active">{note}</p>}
    </div>
  )
}

export function QuoteBreakdown({ quote }: { quote: CartQuote }) {
  const discountIsZero = new Decimal(quote.discount).isZero()

  return (
    <dl className="flex flex-col gap-3">
      <Row label="Subtotal">{formatEth(quote.subtotal)} ETH</Row>
      <Row label={quote.discountLabel}>(-) {discountIsZero ? '00.00' : formatEth(quote.discount)}</Row>
      <Row label="Taxa de rede" note={quote.feeEstimated ? 'Taxa estimada' : undefined}>
        {formatEth(quote.networkFee)} ETH
      </Row>
      <div className="mt-1 flex items-baseline justify-between gap-4 lg:mt-2 lg:border-t lg:border-nav-accent/30 lg:pt-4">
        <dt className="text-base font-bold lg:text-sm">Total</dt>
        <dd className="text-xl font-bold text-nav-active lg:text-lg">{formatEth(quote.total)} ETH</dd>
      </div>
    </dl>
  )
}
