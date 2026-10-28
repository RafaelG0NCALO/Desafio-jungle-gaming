import { useQuery } from '@tanstack/react-query'
import { fetchAlsoViewedNfts } from '@/api/nfts'
import { NftCarousel } from '@/features/catalog/components/NftCarousel'
import { nftKeys } from '@/features/catalog/hooks'

const alsoViewedKey = [...nftKeys.all, 'also-viewed'] as const

export function AlsoViewedNfts() {
  const query = useQuery({
    queryKey: alsoViewedKey,
    queryFn: ({ signal }) => fetchAlsoViewedNfts(signal),
    staleTime: 60_000,
  })

  return (
    <NftCarousel
      title="Colecionadores também viram"
      items={query.data?.items}
      isPending={query.isPending}
      isError={query.isError}
      onRetry={() => query.refetch()}
    />
  )
}
