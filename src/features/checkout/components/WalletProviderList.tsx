import { Wallet } from 'lucide-react'
import { WALLET_TYPES } from '../schema'

interface WalletProviderListProps {
  value: string
  onChange: (value: string) => void
}

const ORDER = ['walletconnect', 'metamask', 'coinbase']
const MARKS: Record<string, string> = { walletconnect: 'W', metamask: 'M' }

export function WalletProviderList({ value, onChange }: WalletProviderListProps) {
  const wallets = ORDER.flatMap((v) => WALLET_TYPES.filter((w) => w.value === v))

  return (
    <fieldset className="lg:hidden">
      <legend className="mb-3 text-sm font-bold">Carteira e rede</legend>
      <div className="flex flex-col gap-3">
        {wallets.map((wallet) => {
          const checked = wallet.value === value
          return (
            <label
              key={wallet.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-nav-active"
            >
              <input
                type="radio"
                name="walletProvider"
                className="sr-only"
                value={wallet.value}
                checked={checked}
                onChange={() => onChange(wallet.value)}
              />
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-sm font-bold text-nav-active">
                {MARKS[wallet.value] ?? <Wallet className="size-5" />}
              </span>
              <span className={`flex-1 text-sm ${checked ? 'font-bold' : ''}`}>{wallet.label}</span>
              <span
                aria-hidden
                className={`grid size-4 shrink-0 place-items-center rounded-full border ${checked ? 'border-nav-active' : 'border-nav-accent'}`}
              >
                {checked && <span className="size-2 rounded-full bg-nav-active" />}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
