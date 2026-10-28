import { useState } from 'react'
import type { FormEvent } from 'react'
import Decimal from 'decimal.js'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { CheckboxGroup } from './components/CheckboxGroup'
import { FeaturedNftCard } from './components/FeaturedNftCard'
import { PriceRange } from './components/PriceRange'
import { useCatalogSearch, useFeaturedNft, useNftList } from './hooks'
import { COLLECTIONS, NETWORKS, PRICE_BOUNDS, SORTS, type SortValue } from './search'

interface Draft {
  collections: string[]
  networks: string[]
  min: string
  max: string
  sort: SortValue
}

const EMPTY: Draft = {
  collections: [],
  networks: [],
  min: PRICE_BOUNDS.min,
  max: PRICE_BOUNDS.max,
  sort: 'recent',
}

const rowClassName = 'py-2.5 text-base'

function FiltersForm({ onDone }: { onDone: () => void }) {
  const { search, update } = useCatalogSearch({ to: '/mercado' })
  const featured = useFeaturedNft()
  const facets = useNftList(search).data?.facets

  const [draft, setDraft] = useState<Draft>({
    collections: search.collections ?? [],
    networks: search.networks ?? [],
    min: search.min ?? PRICE_BOUNDS.min,
    max: search.max ?? PRICE_BOUNDS.max,
    sort: search.sort ?? 'recent',
  })

  const apply = (next: Draft) => {
    update({
      collections: next.collections.length ? next.collections : undefined,
      networks: next.networks.length ? next.networks : undefined,
      min: new Decimal(next.min).eq(PRICE_BOUNDS.min) ? undefined : new Decimal(next.min).toFixed(2),
      max: new Decimal(next.max).eq(PRICE_BOUNDS.max) ? undefined : new Decimal(next.max).toFixed(2),
      sort: next.sort === 'recent' ? undefined : next.sort,
    })
    onDone()
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    apply(draft)
  }

  const toggle = (key: 'collections' | 'networks', value: string) =>
    setDraft((d) => ({
      ...d,
      [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value],
    }))

  return (
    <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6">
        <CheckboxGroup
          legend="Coleções"
          name="sheet-collection"
          options={COLLECTIONS}
          selected={draft.collections}
          counts={facets?.collections}
          onToggle={(v) => toggle('collections', v)}
          rowClassName={rowClassName}
        />

        <fieldset>
          <legend className="mb-3 text-sm font-bold text-nav-text">Faixa de preço</legend>
          <PriceRange min={draft.min} max={draft.max} onChange={(min, max) => setDraft((d) => ({ ...d, min, max }))} />
        </fieldset>

        <CheckboxGroup
          legend="Rede"
          name="sheet-network"
          options={NETWORKS}
          selected={draft.networks}
          counts={facets?.networks}
          onToggle={(v) => toggle('networks', v)}
          rowClassName={rowClassName}
        />

        <fieldset>
          <legend className="mb-2 text-sm font-bold text-nav-text">Ordenar por</legend>
          {SORTS.map((s) => (
            <label key={s.value} className="flex min-h-10 cursor-pointer items-center gap-3 px-2 text-base">
              <input
                type="radio"
                name="sort"
                className="size-5 accent-nav-accent"
                checked={draft.sort === s.value}
                onChange={() => setDraft((d) => ({ ...d, sort: s.value }))}
              />
              {s.label}
            </label>
          ))}
        </fieldset>

        <FeaturedNftCard nft={featured.data} isLoading={featured.isPending} />
      </div>

      <div className="flex gap-3 border-t border-nav-accent/20 p-6">
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY)
            apply(EMPTY)
          }}
          className="h-12 flex-1 rounded-lg border border-nav-accent/40 text-base text-nav-tab hover:border-nav-accent focus-visible:outline-2 focus-visible:outline-nav-active"
        >
          Limpar
        </button>
        <button
          type="submit"
          className="h-12 flex-1 rounded-lg bg-nav-accent text-base font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
        >
          Aplicar
        </button>
      </div>
    </form>
  )
}

export function FiltersSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="p-6 pb-4">
          <SheetTitle className="text-xl font-bold">Filtros</SheetTitle>
          <SheetDescription className="mt-1 text-sm text-nav-tab">Refine os NFTs exibidos.</SheetDescription>
        </div>
        <FiltersForm onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
