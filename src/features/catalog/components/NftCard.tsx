import { Link } from '@tanstack/react-router'
import type { Nft, NftBadge } from '@/api/nfts'

const BADGE_LABELS: Record<NftBadge, string> = { rare: 'RARO' }

export function NftCard({ nft, priority = false }: { nft: Nft; priority?: boolean }) {
  return (
    <li>
      <Link
        to="/nfts/$id"
        params={{ id: nft.id }}
        className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
      >
        <div className="relative rounded-xl bg-surface p-3 pb-6">
          {nft.badge && (
            <span className="absolute top-2 left-0 bg-nav-accent px-6 py-2 text-xs leading-none font-bold tracking-wider text-background">
              {BADGE_LABELS[nft.badge]}
            </span>
          )}
          <img
            src={nft.imageUrl}
            alt={nft.imageAlt}
            width={240}
            height={240}
            loading={priority ? 'eager' : 'lazy'}
            className="aspect-square w-full rounded-lg object-cover"
          />
        </div>
        <h3 className="mt-3 text-xs text-nav-text group-hover:text-nav-active">{nft.name}</h3>
        <p className="mt-2 flex items-baseline gap-2 text-xs">
          <span className="font-bold text-nav-active">{nft.price} ETH</span>
          {nft.previousPrice && (
            <span className="text-nav-tab/80">
              <span className="sr-only">Preço anterior: </span>
              <s>{nft.previousPrice} ETH</s>
            </span>
          )}
        </p>
      </Link>
    </li>
  )
}
