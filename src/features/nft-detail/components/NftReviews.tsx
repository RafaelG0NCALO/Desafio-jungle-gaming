import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNftReviews } from '@/api/nfts'
import { nftKeys } from '@/features/catalog/hooks'
import { ReviewItem } from './ReviewItem'

const PAGE = 5

export function NftReviews({ nftId }: { nftId: string }) {
  const [visible, setVisible] = useState(PAGE)
  const query = useQuery({
    queryKey: [...nftKeys.detail(nftId), 'reviews'],
    queryFn: ({ signal }) => fetchNftReviews(nftId, signal),
    staleTime: 60_000,
  })

  if (query.isPending) {
    return (
      <ul aria-hidden className="flex flex-col gap-3">
        {Array.from({ length: PAGE }, (_, i) => (
          <li key={i} className="skeleton h-28 rounded-xl" />
        ))}
      </ul>
    )
  }

  if (query.isError) {
    return (
      <div role="alert" className="rounded-xl bg-surface p-6 text-center">
        <p className="text-sm">Não foi possível carregar as avaliações.</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-4 h-9 rounded-md bg-nav-accent px-5 text-xs font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const { items, total } = query.data
  if (!items.length) return <p className="text-sm text-nav-tab">Este NFT ainda não tem avaliações.</p>

  return (
    <div>
      <ul className="flex flex-col gap-3">
        {items.slice(0, visible).map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-4 text-xs text-nav-tab">
        <p role="status">
          Mostrando {Math.min(visible, items.length)} de {total} avaliações
        </p>
        {visible < items.length && (
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE)}
            className="h-9 rounded-md border border-nav-accent px-4 text-nav-text hover:bg-nav-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
          >
            Ver mais avaliações
          </button>
        )}
      </div>
    </div>
  )
}
