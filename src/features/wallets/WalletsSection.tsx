import { useState } from 'react'
import { apiErrorMessage } from '@/api/cart'
import type { WalletsResponse } from '@/api/wallets'
import { AccountLayout } from '@/features/account/AccountLayout'
import { WalletForm } from './components/WalletForm'
import { useSecondarySameAsPrimary, useWallets } from './hooks'

const addClass =
  'rounded-sm text-xs font-bold text-nav-active hover:underline focus-visible:outline-2 focus-visible:outline-nav-active'

function PrimarySection({ data }: { data: WalletsResponse }) {
  const primary = data.items.find((w) => w.kind === 'primary')

  return (
    <section aria-labelledby="primary-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="primary-title" className="text-sm font-bold">
            Carteira principal
          </h2>
          <p className="mt-2 text-xs text-nav-tab">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p>
        </div>
        {!primary && (
          <button type="button" onClick={() => document.getElementById('primary-displayName')?.focus()} className={addClass}>
            Adicionar
          </button>
        )}
      </div>

      <div className="mt-6">
        <WalletForm kind="primary" wallet={primary} />
      </div>
    </section>
  )
}

function SecondarySection({ data }: { data: WalletsResponse }) {
  const secondary = data.items.find((w) => w.kind === 'secondary')
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')
  const sameAsPrimary = useSecondarySameAsPrimary()

  const toggleSame = (checked: boolean) => {
    setMessage('')
    sameAsPrimary.mutate(checked, {
      onError: (error) => setMessage(apiErrorMessage(error, 'Não foi possível atualizar a carteira secundária.')),
    })
  }

  return (
    <section aria-labelledby="secondary-title" className="mt-10">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <h2 id="secondary-title" className="text-sm font-bold">
          Carteira secundária
        </h2>
        <div className="flex items-center gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-nav-active">
            <input
              type="checkbox"
              className="size-3.5 accent-nav-accent"
              checked={sameAsPrimary.isPending ? sameAsPrimary.variables : data.secondarySameAsPrimary}
              disabled={sameAsPrimary.isPending}
              onChange={(e) => toggleSame(e.target.checked)}
            />
            Igual à carteira principal
          </label>
          {!secondary && !data.secondarySameAsPrimary && !adding && (
            <button type="button" onClick={() => setAdding(true)} className={addClass}>
              Adicionar
            </button>
          )}
        </div>
      </div>

      {message && (
        <p role="alert" className="mt-2 text-xs text-nav-active">
          {message}
        </p>
      )}

      {data.secondarySameAsPrimary ? (
        <p className="mt-2 text-xs text-nav-tab">A carteira secundária usa os mesmos dados da carteira principal.</p>
      ) : secondary || adding ? (
        <div className="mt-6">
          <WalletForm kind="secondary" wallet={secondary} />
        </div>
      ) : (
        <p className="mt-2 text-xs text-nav-tab">Você ainda não adicionou uma carteira secundária.</p>
      )}
    </section>
  )
}

export function WalletsSection() {
  const query = useWallets()

  let content
  if (query.isPending) {
    content = (
      <div aria-hidden className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-16 rounded-md" />
        ))}
      </div>
    )
  } else if (query.isError) {
    content = (
      <div role="alert" className="rounded-xl bg-surface px-6 py-12 text-center">
        <p className="text-sm">Não foi possível carregar suas carteiras.</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-4 h-9 rounded-md bg-nav-accent px-5 text-xs font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
        >
          Tentar novamente
        </button>
      </div>
    )
  } else {
    content = (
      <>
        <PrimarySection data={query.data} />
        <SecondarySection data={query.data} />
      </>
    )
  }

  return (
    <AccountLayout title="Carteiras">
      <h1 className="sr-only">Carteiras</h1>
      <div aria-busy={query.isPending}>{content}</div>
    </AccountLayout>
  )
}
