import type { Nft } from '@/api/nfts'
import { PAGE_SIZE } from '../hooks'
import { CatalogEmpty, CatalogError } from './CatalogStates'
import { NftCard } from './NftCard'
import { NftCardSkeleton } from './NftCardSkeleton'

interface NftGridProps {
  items?: Nft[]
  total?: number
  isPending: boolean
  isError: boolean
  isFetching: boolean
  onRetry: () => void
  onClear: () => void
}

export function NftGrid({ items, total, isPending, isError, isFetching, onRetry, onClear }: NftGridProps) {
  const announcement = isPending
    ? 'Carregando NFTs'
    : isError
      ? 'Falha ao carregar NFTs'
      : `${total ?? 0} ${total === 1 ? 'NFT encontrado' : 'NFTs encontrados'}`

  let content
  if (isError) {
    content = <CatalogError onRetry={onRetry} />
  } else if (!isPending && items?.length === 0) {
    content = <CatalogEmpty onClear={onClear} />
  } else {
    content = (
      <ul
        aria-busy={isPending || isFetching}
        className={`grid grid-cols-2 gap-x-4 gap-y-6 transition-opacity sm:grid-cols-3 lg:gap-x-6 lg:gap-y-8 ${
          isFetching && !isPending ? 'opacity-60' : ''
        }`}
      >
        {isPending
          ? Array.from({ length: PAGE_SIZE }, (_, i) => <NftCardSkeleton key={i} />)
          : items?.map((nft, i) => <NftCard key={nft.id} nft={nft} priority={i < 3} />)}
      </ul>
    )
  }

  return (
    <div>
      <p role="status" className="sr-only">
        {announcement}
      </p>
      {content}
    </div>
  )
}
