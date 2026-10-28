import { apiErrorMessage } from '@/api/cart'
import { NETWORKS } from '@/features/catalog/search'
import { isConnectedTo, useConnectWallet, useDisconnectWallet, useWalletConnection, type WalletChoice } from '@/features/wallets/connection'
import { WALLET_TYPES } from '../schema'

const ADDRESS = /^0x[a-fA-F0-9]{40}$/
const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`

const button =
  'h-8 shrink-0 rounded-md px-4 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:cursor-not-allowed disabled:opacity-50'

export function WalletConnectionStatus({ choice }: { choice: WalletChoice }) {
  const connection = useWalletConnection()
  const connect = useConnectWallet()
  const disconnect = useDisconnectWallet()

  const provider = WALLET_TYPES.find((w) => w.value === choice.provider)?.label ?? choice.provider
  const network = NETWORKS.find((n) => n.value === choice.network)?.label ?? choice.network
  const ready = !!choice.provider && !!choice.network && ADDRESS.test(choice.address.trim())
  const connected = isConnectedTo(connection.data, choice)
  const stale = !!connection.data && !connected

  let text: string
  if (connect.isPending) text = `Conectando à ${provider}…`
  else if (connected) text = `Carteira conectada: ${provider} · ${shortAddress(choice.address.trim())} · ${network}`
  else if (stale) text = 'Os dados da carteira mudaram. Conecte novamente.'
  else if (!ready) text = 'Escolha a rede e informe o endereço da carteira para conectar.'
  else text = 'Nenhuma carteira conectada.'

  return (
    <div className="rounded-md border border-nav-accent/30 p-3">
      <div className="flex items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-xs">
          {text}
        </p>
        {connected ? (
          <button
            type="button"
            disabled={disconnect.isPending}
            onClick={() => disconnect.mutate()}
            className={`${button} border border-nav-accent text-nav-text hover:bg-nav-accent/10`}
          >
            Desconectar
          </button>
        ) : (
          <button
            type="button"
            disabled={!ready || connect.isPending}
            onClick={() => connect.mutate({ provider: choice.provider, network: choice.network, address: choice.address.trim() })}
            className={`${button} bg-nav-accent text-background hover:opacity-90`}
          >
            {connect.isPending ? 'Conectando…' : 'Conectar carteira'}
          </button>
        )}
      </div>
      {connect.isError && (
        <p role="alert" className="mt-2 text-xs text-nav-active">
          {apiErrorMessage(connect.error, 'Não foi possível conectar a carteira. Tente novamente.')}
        </p>
      )}
    </div>
  )
}
