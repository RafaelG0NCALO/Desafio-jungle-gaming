import { http } from './http'

export interface WalletConnection {
  provider: string
  network: string
  address: string
  connectedAt: string
}

export interface ConnectInput {
  provider: string
  network: string
  address: string
}

export async function fetchConnection(signal?: AbortSignal): Promise<WalletConnection | null> {
  const { data } = await http.get<{ connection: WalletConnection | null }>('/wallet-connection', { signal })
  return data.connection
}

export async function connectWallet(input: ConnectInput): Promise<WalletConnection> {
  const { data } = await http.post<{ connection: WalletConnection }>('/wallet-connection', input)
  return data.connection
}

export async function disconnectWallet(): Promise<void> {
  await http.delete('/wallet-connection')
}
