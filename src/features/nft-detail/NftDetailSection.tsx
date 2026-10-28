import type { ReactNode } from 'react'
import { Heart } from 'lucide-react'
import type { NftDetail } from '@/api/nfts'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { MobileBarButton, MobilePageBar } from '@/components/layout/MobilePageBar'
import { LiveNotices } from '@/features/realtime/LiveNotices'
import { MobilePurchaseBar } from './components/MobilePurchaseBar'
import { NftDetailSkeleton } from './components/NftDetailSkeleton'
import { NftNotFound, NftLoadError } from './components/NftDetailStates'
import { NftDetailsTabs } from './components/NftDetailsTabs'
import { NftGallery } from './components/NftGallery'
import { NftPurchasePanel } from './components/NftPurchasePanel'
import { RelatedNfts } from './components/RelatedNfts'
import { isNotFound, useNftDetail } from './hooks'
import { useFavorite } from '@/features/favorites/hooks'
import { usePurchase } from './usePurchase'

interface DetailShellProps {
  children: ReactNode
  busy?: boolean
  trailing?: ReactNode
}

function DetailShell({ children, busy, trailing }: DetailShellProps) {
  return (
    <>
      <MobilePageBar backFallback="/mercado" trailing={trailing} />
      <section aria-busy={busy} className="mx-auto max-w-360 px-4 pb-6 md:px-8 lg:px-16 lg:py-8">
        <div className="hidden lg:block">
          <Breadcrumb
            items={[
              { label: 'Início', to: '/' },
              { label: 'Mercado', to: '/mercado' },
            ]}
          />
        </div>
        <div className="lg:mt-6">{children}</div>
      </section>
    </>
  )
}

function NftDetailContent({ nft }: { nft: NftDetail }) {
  const purchase = usePurchase(nft)
  const favorite = useFavorite(nft)

  return (
    <>
      <DetailShell
        trailing={
          <MobileBarButton aria-label={favorite.isFavorite ? 'Remover dos favoritos' : 'Favoritar'} aria-pressed={favorite.isFavorite} onClick={favorite.toggle}>
            <Heart className="size-5" fill={favorite.isFavorite ? 'currentColor' : 'none'} aria-hidden />
          </MobileBarButton>
        }
      >
        <LiveNotices scopes={['nft', 'connection']} resourceId={nft.id} />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
          <NftGallery images={nft.gallery} />
          <NftPurchasePanel nft={nft} purchase={purchase} favorite={favorite} />
        </div>
        <div className="mt-10 lg:mt-12">
          <NftDetailsTabs nft={nft} />
        </div>
        <div className="mt-10 lg:mt-12">
          <RelatedNfts nftId={nft.id} />
        </div>
      </DetailShell>
      <MobilePurchaseBar nft={nft} purchase={purchase} />
    </>
  )
}

export function NftDetailSection({ id }: { id: string }) {
  const query = useNftDetail(id)

  if (query.isPending) {
    return (
      <DetailShell busy>
        <NftDetailSkeleton />
      </DetailShell>
    )
  }
  if (query.isError) {
    return (
      <DetailShell>{isNotFound(query.error) ? <NftNotFound /> : <NftLoadError onRetry={() => query.refetch()} />}</DetailShell>
    )
  }
  return <NftDetailContent key={query.data.id} nft={query.data} />
}
