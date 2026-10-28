interface StateProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

function CatalogState({ title, description, actionLabel, onAction }: StateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-surface px-6 py-16 text-center">
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-nav-tab">{description}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-6 h-10 rounded-md bg-nav-accent px-6 text-sm font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
      >
        {actionLabel}
      </button>
    </div>
  )
}

export function CatalogEmpty({ onClear }: { onClear: () => void }) {
  return (
    <CatalogState
      title="Nenhum NFT encontrado"
      description="Não há NFTs com esses filtros. Tente ampliar a faixa de preço ou remover alguma seleção."
      actionLabel="Limpar filtros"
      onAction={onClear}
    />
  )
}

export function CatalogError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert">
      <CatalogState
        title="Não foi possível carregar os NFTs"
        description="Houve uma falha ao buscar o catálogo. Verifique sua conexão e tente novamente."
        actionLabel="Tentar novamente"
        onAction={onRetry}
      />
    </div>
  )
}
