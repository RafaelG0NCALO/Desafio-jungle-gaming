import { useId, useState } from 'react'
import type { Nft } from '@/api/nfts'
import { PageDots } from '@/components/ui/PageDots'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { NftCard } from './NftCard'
import { NftCardSkeleton } from './NftCardSkeleton'

function usePageSize() {
  const desktop = useMediaQuery('(min-width: 1024px)')
  const tablet = useMediaQuery('(min-width: 768px)')
  return desktop ? 5 : tablet ? 3 : 2
}

interface NftCarouselProps {
  title: string
  items?: Nft[]
  isPending: boolean
  isError: boolean
  onRetry: () => void
}

export function NftCarousel({ title, items = [], isPending, isError, onRetry }: NftCarouselProps) {
  const titleId = useId()
  const pageSize = usePageSize()
  const [page, setPage] = useState(0)

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(page, pageCount - 1)

  const heading = (
    <h2 id={titleId} className="border-b border-nav-accent/40 pb-3 text-sm font-bold text-nav-active">
      {title}
    </h2>
  )

  if (isError) {
    return (
      <section aria-labelledby={titleId}>
        {heading}
        <div role="alert" className="mt-6 text-sm text-nav-tab">
          Não foi possível carregar esta lista.{' '}
          <button
            type="button"
            onClick={onRetry}
            className="rounded-sm text-nav-active underline focus-visible:outline-2 focus-visible:outline-nav-active"
          >
            Tentar novamente
          </button>
        </div>
      </section>
    )
  }
  if (!isPending && items.length === 0) return null

  return (
    <section aria-labelledby={titleId} aria-busy={isPending}>
      {heading}
      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
        {isPending
          ? Array.from({ length: pageSize }, (_, i) => <NftCardSkeleton key={i} />)
          : items.slice(current * pageSize, (current + 1) * pageSize).map((nft) => <NftCard key={nft.id} nft={nft} />)}
      </ul>
      <div className="mt-6">
        <PageDots count={pageCount} active={current} onChange={setPage} label={`Páginas: ${title}`} />
      </div>
    </section>
  )
}
