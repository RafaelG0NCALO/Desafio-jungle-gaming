import { Heart } from 'lucide-react'
import type { NftDetail } from '@/api/nfts'
import type { useFavorite } from '@/features/favorites/hooks'
import type { Purchase } from '../usePurchase'
import { EditionSelector } from './EditionSelector'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { RatingStars } from './RatingStars'
import { ShareLinks } from './ShareLinks'

type Favorite = ReturnType<typeof useFavorite>

export function NftPurchasePanel({ nft, purchase, favorite }: { nft: NftDetail; purchase: Purchase; favorite: Favorite }) {
  const { editionId, selectEdition, quantity, setQuantity, max, soldOut, adding, addToCart, notice } = purchase

  return (
    <div className="flex min-w-0 flex-col">
      <header className="border-b border-nav-accent/40 pb-4">
        <h1 className="text-2xl leading-tight font-bold lg:text-3xl">{nft.name}</h1>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="text-xl font-bold text-nav-active">{nft.price} ETH</p>
          <RatingStars average={nft.rating.average} count={nft.rating.count} />
        </div>
      </header>

      <div className="mt-5 flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-bold">Sobre este NFT:</h2>
          <p className="mt-2 max-w-prose text-xs leading-relaxed text-nav-tab">{nft.description}</p>
        </div>

        <EditionSelector editions={nft.editions} value={editionId} onChange={selectEdition} />

        {soldOut && (
          <p role="status" className="text-sm text-nav-active">
            Esta edição está esgotada. Escolha outra edição.
          </p>
        )}

        <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
          <div className="hidden lg:block">
            <QuantityStepper value={quantity} max={max} onChange={setQuantity} />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={soldOut || adding}
              onClick={() => addToCart(true)}
              className="hidden h-10 rounded-md bg-nav-accent px-8 text-sm font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:cursor-not-allowed disabled:opacity-40 lg:block"
            >
              COMPRAR
            </button>
            <button
              type="button"
              aria-pressed={favorite.isFavorite}
              onClick={favorite.toggle}
              className="hidden h-10 items-center gap-2 rounded-md border border-nav-accent px-5 text-sm text-nav-text hover:bg-nav-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active lg:inline-flex"
            >
              <Heart className="size-4" fill={favorite.isFavorite ? 'currentColor' : 'none'} aria-hidden />
              {favorite.isFavorite ? 'Favoritado' : 'Favoritar'}
            </button>
          </div>
        </div>

        <p role="status" aria-live="polite" className="min-h-5 text-xs text-nav-active">
          {notice || favorite.message}
        </p>

        <dl className="flex flex-col gap-2 text-xs text-nav-tab">
          <div className="flex gap-1">
            <dt>ID do token:</dt>
            <dd>{nft.tokenId}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Coleção:</dt>
            <dd>{nft.collectionName}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Atributos:</dt>
            <dd>{nft.attributes.join(', ')}</dd>
          </div>
        </dl>

        <ShareLinks name={nft.name} />
      </div>
    </div>
  )
}
