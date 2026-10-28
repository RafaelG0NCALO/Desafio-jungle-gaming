import { Link } from '@tanstack/react-router'
import { EllipsisVertical } from 'lucide-react'
import type { Wallet } from '@/api/wallets'
import { NETWORKS } from '@/features/catalog/search'

const networkLabel = (value: string) => NETWORKS.find((n) => n.value === value)?.label ?? value

const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`

interface RegisteredWalletsProps {
  wallets?: Wallet[]
  isPending: boolean
  isError: boolean
  selectedId?: string
  onSelect: (wallet: Wallet) => void
  onRetry: () => void
  onOptions: (wallet: Wallet) => void
}

export function RegisteredWallets({ wallets, isPending, isError, selectedId, onSelect, onRetry, onOptions }: RegisteredWalletsProps) {
  return (
    <fieldset className="lg:hidden">
      <div className="mb-3 flex items-center justify-between gap-4">
        <legend className="float-left text-sm font-bold">Carteira conectada</legend>
        <Link
          to="/carteiras"
          className="rounded-sm text-xs font-bold text-nav-active hover:underline focus-visible:outline-2 focus-visible:outline-nav-active"
        >
          Trocar carteira
        </Link>
      </div>

      <div className="clear-both flex flex-col gap-3">
        {isPending && (
          <div aria-hidden className="flex flex-col gap-3">
            <div className="skeleton h-20 rounded-xl" />
            <div className="skeleton h-20 rounded-xl" />
          </div>
        )}

        {isError && (
          <p role="alert" className="text-sm text-nav-tab">
            Não foi possível carregar suas carteiras.{' '}
            <button type="button" onClick={onRetry} className="rounded-sm text-nav-active underline focus-visible:outline-2 focus-visible:outline-nav-active">
              Tentar novamente
            </button>
          </p>
        )}

        {wallets?.map((wallet) => {
          const checked = wallet.id === selectedId
          return (
            <div
              key={wallet.id}
              className="flex items-start gap-3 rounded-xl bg-surface p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-nav-active"
            >
              <label className="flex flex-1 cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="registeredWallet"
                  className="sr-only"
                  checked={checked}
                  onChange={() => onSelect(wallet)}
                />
                <span
                  aria-hidden
                  className={`mt-1 grid size-4 shrink-0 place-items-center rounded-full border ${checked ? 'border-nav-active' : 'border-nav-accent'}`}
                >
                  {checked && <span className="size-2 rounded-full bg-nav-active" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{wallet.label}</span>
                  <span className="mt-1 block text-xs text-nav-tab">{wallet.ensName ? `${wallet.ensName}${wallet.ensSuffix}` : shortAddress(wallet.address)}</span>
                  <span className="mt-1 block text-xs text-nav-tab">
                    {wallet.kind === 'primary' ? 'Rede principal' : 'Rede'} {networkLabel(wallet.network)}
                  </span>
                </span>
              </label>
              <button
                type="button"
                aria-label={`Opções da carteira ${wallet.label}`}
                onClick={() => onOptions(wallet)}
                className="rounded-sm p-1 text-nav-tab hover:text-nav-active focus-visible:outline-2 focus-visible:outline-nav-active"
              >
                <EllipsisVertical className="size-4" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
