import { useQuery } from '@tanstack/react-query'
import { fetchRelatedNfts } from '@/api/nfts'
import { NftCarousel } from '@/features/catalog/components/NftCarousel'
import { nftKeys } from '@/features/catalog/hooks'

export function RelatedNfts({ nftId }: { nftId: string }) {
  const query = useQuery({
    queryKey: [...nftKeys.detail(nftId), 'related'],
    queryFn: ({ signal }) => fetchRelatedNfts(nftId, signal),
    staleTime: 60_000,
  })

  return (
    <NftCarousel
      title="Mais desta coleção"
      items={query.data?.items}
      isPending={query.isPending}
      isError={query.isError}
      onRetry={() => query.refetch()}
    />
  )
}
