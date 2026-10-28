import cartIcon from '@/assets/icons/cart-icon.svg'
import type { NftDetail } from '@/api/nfts'
import type { Purchase } from '../usePurchase'
import { QuantityStepper } from '@/components/ui/QuantityStepper'

export function MobilePurchaseBar({ nft, purchase }: { nft: NftDetail; purchase: Purchase }) {
  const { quantity, setQuantity, max, soldOut, adding, addToCart } = purchase

  return (
    <div
      role="region"
      aria-label="Comprar este NFT"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-3xl bg-surface p-4 shadow-lg shadow-black/40 lg:hidden"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-nav-tab">Qtd.</span>
          <QuantityStepper compact value={quantity} max={max} onChange={setQuantity} />
        </div>
        <p className="text-lg font-bold text-nav-active">{nft.price} ETH</p>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={soldOut || adding}
          onClick={() => addToCart(true)}
          className="h-12 flex-1 rounded-full bg-linear-to-r from-nav-active to-nav-accent text-base font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:cursor-not-allowed disabled:opacity-40"
        >
          {soldOut ? 'Esgotado' : 'Comprar NFT'}
        </button>
        <button
          type="button"
          aria-label="Adicionar ao carrinho"
          disabled={soldOut || adding}
          onClick={() => addToCart(false)}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-background/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:cursor-not-allowed disabled:opacity-40"
        >
          <img src={cartIcon} alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  )
}
