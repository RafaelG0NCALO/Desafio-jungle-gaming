import { useId } from 'react'
import { Link } from '@tanstack/react-router'
import type { Nft } from '@/api/nfts'

interface FeaturedNftCardProps {
  nft?: Nft
  isLoading: boolean
}

export function FeaturedNftCard({ nft, isLoading }: FeaturedNftCardProps) {
  const titleId = useId()
  return (
    <aside aria-labelledby={titleId} className="overflow-hidden rounded-xl bg-linear-to-b from-[#3a2518] to-surface pt-4">
      <div className="px-4">
        <h2 id={titleId} className="text-base font-bold tracking-wide text-nav-active">
          NFT EM DESTAQUE
        </h2>
        <p className="mt-1 text-sm font-bold">OFERTA LIMITADA</p>
      </div>

      <div className="mt-3 aspect-square">
        {isLoading || !nft ? (
          <div className="skeleton size-full rounded-t-2xl" aria-hidden />
        ) : (
          <Link
            to="/nfts/$id"
            params={{ id: nft.id }}
            aria-label={`${nft.name}, ${nft.price} ETH`}
            className="block size-full rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nav-active"
          >
            <img src={nft.imageUrl} alt={nft.imageAlt} width={240} height={240} loading="lazy" className="size-full rounded-2xl object-cover" />
          </Link>
        )}
      </div>
    </aside>
  )
}
