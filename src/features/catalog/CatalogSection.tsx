import { CatalogPagination } from './components/CatalogPagination'
import { CatalogSidebar } from './components/CatalogSidebar'
import { CatalogToolbar } from './components/CatalogToolbar'
import { NftGrid } from './components/NftGrid'
import { useCatalogSearch, useNftList } from './hooks'

export function CatalogSection() {
  const { search, setPage, clear } = useCatalogSearch()
  const query = useNftList(search)

  return (
    <section aria-labelledby="catalog-title" className="mx-auto max-w-360 px-4 py-8 md:px-8 lg:px-16 lg:py-12">
      <h2 id="catalog-title" className="sr-only">
        Catálogo de NFTs
      </h2>

      <div className="grid gap-8 lg:grid-cols-[15rem_1fr] xl:grid-cols-[17rem_1fr]">
        <div className="hidden lg:block">
          <CatalogSidebar facets={query.data?.facets} />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <CatalogToolbar />
          <NftGrid
            items={query.data?.items}
            total={query.data?.total}
            isPending={query.isPending}
            isError={query.isError}
            isFetching={query.isFetching}
            onRetry={() => query.refetch()}
            onClear={clear}
          />
          <CatalogPagination page={query.data?.page ?? search.page ?? 1} totalPages={query.data?.totalPages ?? 1} onChange={setPage} />
        </div>
      </div>
    </section>
  )
}
