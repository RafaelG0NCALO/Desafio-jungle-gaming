import { createFileRoute } from '@tanstack/react-router'
import { NftDetailSection } from '@/features/nft-detail/NftDetailSection'

function NftDetailRoute() {
  const { id } = Route.useParams()
  return (
    <main>
      <NftDetailSection id={id} />
    </main>
  )
}

export const Route = createFileRoute('/nfts/$id')({
  component: NftDetailRoute,
})
