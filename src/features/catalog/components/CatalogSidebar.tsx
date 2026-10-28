import type { NftFacets } from '@/api/nfts'
import { useFeaturedNft, useCatalogSearch } from '../hooks'
import { COLLECTIONS, NETWORKS } from '../search'
import { CheckboxGroup } from './CheckboxGroup'
import { FeaturedNftCard } from './FeaturedNftCard'
import { PriceRangeFilter } from './PriceRangeFilter'

const toggle = (list: string[] | undefined, value: string) => {
  const current = list ?? []
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
  return next.length ? next : undefined
}

export function CatalogSidebar({ facets }: { facets?: NftFacets }) {
  const { search, update } = useCatalogSearch()
  const featured = useFeaturedNft()

  return (
    <div className="flex flex-col gap-4">
      <div aria-label="Filtros" role="group" className="flex flex-col gap-6 rounded-xl bg-surface p-4">
        <CheckboxGroup
          legend="Coleções"
          name="collection"
          options={COLLECTIONS}
          selected={search.collections ?? []}
          counts={facets?.collections}
          onToggle={(v) => update({ collections: toggle(search.collections, v) })}
        />
        <PriceRangeFilter min={search.min} max={search.max} onApply={(min, max) => update({ min, max })} />
        <CheckboxGroup
          legend="Rede"
          name="network"
          options={NETWORKS}
          selected={search.networks ?? []}
          counts={facets?.networks}
          onToggle={(v) => update({ networks: toggle(search.networks, v) })}
        />
      </div>
      <FeaturedNftCard nft={featured.data} isLoading={featured.isPending} />
    </div>
  )
}
