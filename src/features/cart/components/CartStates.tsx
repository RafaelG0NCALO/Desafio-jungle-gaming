import { Link } from '@tanstack/react-router'

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center rounded-xl bg-surface px-6 py-16 text-center">
      <h2 className="text-base font-bold">Seu carrinho está vazio</h2>
      <p className="mt-2 max-w-sm text-sm text-nav-tab">Explore o mercado e adicione os NFTs que quiser colecionar.</p>
      <Link
        to="/mercado"
        className="mt-6 inline-flex h-10 items-center rounded-md bg-nav-accent px-6 text-sm font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
      >
        Ir para o mercado
      </Link>
    </div>
  )
}

export function CartLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-xl bg-surface px-6 py-16 text-center">
      <h2 className="text-base font-bold">Não foi possível carregar o carrinho</h2>
      <p className="mt-2 max-w-sm text-sm text-nav-tab">Houve uma falha de conexão. Seus itens continuam salvos.</p>
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
