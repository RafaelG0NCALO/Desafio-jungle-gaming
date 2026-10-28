import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

const buttonClass =
  'mt-6 inline-flex h-10 items-center rounded-md bg-nav-accent px-6 text-sm font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active'

function StateCard({ title, children, role }: { title: string; children: ReactNode; role?: 'alert' | 'status' }) {
  return (
    <div role={role} className="mx-auto flex w-full max-w-lg flex-col items-center border-b-4 border-nav-accent bg-surface px-6 py-16 text-center">
      <h1 className="text-base font-bold">{title}</h1>
      {children}
    </div>
  )
}

export function OrderSkeleton() {
  return (
    <div aria-hidden className="mx-auto flex w-full max-w-lg flex-col gap-4 border-b-4 border-nav-accent bg-surface p-6">
      <div className="skeleton mx-auto h-20 w-16 rounded" />
      <div className="skeleton mx-auto h-4 w-2/3 rounded" />
      <div className="skeleton h-12 rounded" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="skeleton h-10 rounded" />
      ))}
    </div>
  )
}

export function OrderPending() {
  return (
    <StateCard title="Estamos confirmando seu pedido" role="status">
      <p className="mt-2 max-w-sm text-sm text-nav-tab">
        A transação está sendo processada na rede. Você pode recarregar ou fechar esta página: o pedido continua salvo e não será duplicado.
      </p>
    </StateCard>
  )
}

export function OrderDeclined() {
  return (
    <StateCard title="Pagamento recusado" role="alert">
      <p className="mt-2 max-w-sm text-sm text-nav-tab">A transação não foi aprovada e nenhum valor foi cobrado. Seus itens continuam no carrinho.</p>
      <Link to="/carrinho" className={buttonClass}>
        Voltar ao carrinho
      </Link>
    </StateCard>
  )
}

export function OrderNotFound() {
  return (
    <StateCard title="Pedido não encontrado">
      <p className="mt-2 max-w-sm text-sm text-nav-tab">Este pedido não existe ou não está disponível para esta conta.</p>
      <Link to="/mercado" className={buttonClass}>
        Ir para o mercado
      </Link>
    </StateCard>
  )
}

export function OrderForbidden() {
  return (
    <StateCard title="Sem acesso a este pedido" role="alert">
      <p className="mt-2 max-w-sm text-sm text-nav-tab">Este pedido pertence a outra conta.</p>
      <Link to="/mercado" className={buttonClass}>
        Ir para o mercado
      </Link>
    </StateCard>
  )
}

export function OrderLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <StateCard title="Não foi possível carregar o pedido" role="alert">
      <p className="mt-2 max-w-sm text-sm text-nav-tab">Houve uma falha de conexão. Seu pedido está salvo e não será duplicado.</p>
      <button type="button" onClick={onRetry} className={buttonClass}>
        Tentar novamente
      </button>
    </StateCard>
  )
}
