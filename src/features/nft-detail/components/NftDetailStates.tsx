import { Link } from '@tanstack/react-router'

export function NftNotFound() {
  return (
    <div className="flex flex-col items-center rounded-xl bg-surface px-6 py-20 text-center">
      <h1 className="text-2xl font-bold">NFT não encontrado</h1>
      <p className="mt-2 max-w-sm text-sm text-nav-tab">Este NFT não existe ou foi removido do mercado.</p>
      <Link
        to="/mercado"
        className="mt-6 inline-flex h-10 items-center rounded-md bg-nav-accent px-6 text-sm font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
      >
        Voltar ao mercado
      </Link>
    </div>
  )
}

export function NftLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-xl bg-surface px-6 py-20 text-center">
      <h1 className="text-2xl font-bold">Não foi possível carregar este NFT</h1>
      <p className="mt-2 max-w-sm text-sm text-nav-tab">Houve uma falha de conexão. Tente novamente.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 h-10 rounded-md bg-nav-accent px-6 text-sm font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
      >
        Tentar novamente
      </button>
    </div>
  )
}
