import { WALLET_TYPES } from '../schema'

interface WalletRadioGroupProps {
  value: string
  onChange: (value: string) => void
}

const ORDER = ['walletconnect', 'metamask', 'coinbase']

export function WalletRadioGroup({ value, onChange }: WalletRadioGroupProps) {
  const wallets = ORDER.flatMap((v) => WALLET_TYPES.filter((w) => w.value === v))

  return (
    <fieldset>
      <legend className="mx-auto mb-3 text-sm font-bold">Carteira e rede</legend>
      <div className="flex flex-col gap-3">
        {wallets.map((wallet) => {
          const checked = wallet.value === value
          return (
            <label
              key={wallet.value}
              className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-xs has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-nav-active ${
                checked ? 'border-nav-active bg-surface font-bold' : 'border-nav-accent/30 hover:border-nav-accent'
              }`}
            >
              <input
                type="radio"
                name="walletType"
                className="sr-only"
                value={wallet.value}
                checked={checked}
                onChange={() => onChange(wallet.value)}
              />
              <span
                aria-hidden
                className={`grid size-4 shrink-0 place-items-center rounded-full border ${checked ? 'border-nav-active' : 'border-nav-accent'}`}
              >
                {checked && <span className="size-2 rounded-full bg-nav-active" />}
              </span>
              {wallet.value === 'walletconnect' ? (
                <>
                  <span className="sr-only">{wallet.label} (MetaMask, WalletConnect, Coinbase)</span>
                  <span aria-hidden className="rounded bg-nav-accent/20 px-2 py-1 text-[8px] tracking-widest text-nav-tab">
                    METAMASK · WALLETCONNECT · COINBASE
                  </span>
                </>
              ) : (
                wallet.label
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
