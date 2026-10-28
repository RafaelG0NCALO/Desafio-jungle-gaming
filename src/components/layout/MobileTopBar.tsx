import { lazy, Suspense, useState } from 'react'
import type { FormEvent } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
const FiltersSheet = lazy(() => import('@/features/catalog/FiltersSheet').then((m) => ({ default: m.FiltersSheet })))
import { useCatalogSearch } from '@/features/catalog/hooks'
import { countActiveFilters } from '@/features/catalog/search'

export function MobileTopBar() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filtersLoaded, setFiltersLoaded] = useState(false)
  const { search, update } = useCatalogSearch({ to: '/mercado' })
  const [query, setQuery] = useState(search.q ?? '')
  const active = countActiveFilters(search)

  const [seenQuery, setSeenQuery] = useState(search.q)
  if (seenQuery !== search.q) {
    setSeenQuery(search.q)
    setQuery(search.q ?? '')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    update({ q: query.trim() || undefined })
  }

  return (
    <form role="search" onSubmit={submit} className="flex items-center gap-3 bg-background px-4 py-4 md:px-8 lg:hidden">
      <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl bg-surface px-4 focus-within:outline-2 focus-within:outline-nav-active">
        <Search className="size-5 shrink-0 text-nav-accent" aria-hidden />
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          enterKeyHint="search"
          placeholder="Explorar coleções"
          aria-label="Explorar coleções"
          className="min-w-0 flex-1 bg-transparent text-base leading-none text-nav-accent placeholder:text-nav-accent focus:outline-none"
        />
      </label>
      <button
        type="button"
        aria-label={active ? `Filtros, ${active} ativos` : 'Filtros'}
        aria-haspopup="dialog"
        onClick={() => {
          setFiltersLoaded(true)
          setFiltersOpen(true)
        }}
        className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-linear-to-br from-nav-active to-nav-accent text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
      >
        <SlidersHorizontal className="size-5" aria-hidden />
        {active > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-background text-[11px] leading-none font-bold text-nav-active"
          >
            {active}
          </span>
        )}
      </button>
      {filtersLoaded && (
        <Suspense fallback={null}>
          <FiltersSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
        </Suspense>
      )}
    </form>
  )
}
