import { useCatalogSearch } from '../hooks'
import { CatalogTabs } from './CatalogTabs'
import { SortSelect } from './SortSelect'

export function CatalogToolbar() {
  const { search, update } = useCatalogSearch()

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <CatalogTabs value={search.tab} onChange={(tab) => update({ tab })} />
      <div className="hidden lg:block">
        <SortSelect value={search.sort ?? 'recent'} onChange={(sort) => update({ sort: sort === 'recent' ? undefined : sort })} />
      </div>
    </div>
  )
}
