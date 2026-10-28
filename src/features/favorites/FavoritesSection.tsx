import { Link } from '@tanstack/react-router'
import { AccountLayout } from '@/features/account/AccountLayout'
import { NftCard } from '@/features/catalog/components/NftCard'
import { NftCardSkeleton } from '@/features/catalog/components/NftCardSkeleton'
import { useFavorites } from './hooks'

export function FavoritesSection() {
  const query = useFavorites()
  const items = query.data?.items

  let content
  if (query.isError) {
    content = (
      <div role="alert" className="rounded-xl bg-surface px-6 py-12 text-center">
        <p className="text-sm">Não foi possível carregar sua lista de interesse.</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-4 h-9 rounded-md bg-nav-accent px-5 text-xs font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
        >
          Tentar novamente
        </button>
      </div>
    )
  } else if (items && items.length === 0) {
    content = (
      <div className="rounded-xl bg-surface px-6 py-12 text-center">
        <p className="text-sm">Você ainda não favoritou nenhum NFT.</p>
        <Link
          to="/mercado"
          className="mt-4 inline-flex h-9 items-center rounded-md bg-nav-accent px-5 text-xs font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
        >
          Ir para o mercado
        </Link>
      </div>
    )
  } else {
    content = (
      <ul aria-busy={!items} className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
        {items ? items.map((nft) => <NftCard key={nft.id} nft={nft} />) : Array.from({ length: 6 }, (_, i) => <NftCardSkeleton key={i} />)}
      </ul>
    )
  }

  return (
    <AccountLayout title="Lista de interesse">
      <h1 className="sr-only">Lista de interesse</h1>
      {content}
    </AccountLayout>
  )
}
