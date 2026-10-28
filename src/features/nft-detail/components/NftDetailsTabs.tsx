import type { NftDetail } from '@/api/nfts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NftAbout } from './NftAbout'
import { NftReviews } from './NftReviews'

export function NftDetailsTabs({ nft }: { nft: NftDetail }) {
  return (
    <Tabs defaultValue="details">
      <TabsList aria-label="Informações do NFT">
        <TabsTrigger value="details">Detalhes do NFT</TabsTrigger>
        <TabsTrigger value="reviews">Avaliações de colecionadores ({nft.rating.count})</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        <NftAbout nft={nft} />
      </TabsContent>
      <TabsContent value="reviews">
        <NftReviews nftId={nft.id} />
      </TabsContent>
    </Tabs>
  )
}
