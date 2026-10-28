import { http } from './http'

export type WalletKind = 'primary' | 'secondary'

export interface WalletInput {
  label: string
  displayName: string
  profileName: string
  email: string
  network: string
  address: string
  secondaryAddress: string
  walletType: string
  referralCode: string
  ensName: string
  ensSuffix: string
}

export interface Wallet extends WalletInput {
  id: string
  kind: WalletKind
  isDefault: boolean
}

export interface WalletsResponse {
  items: Wallet[]
  secondarySameAsPrimary: boolean
}

export async function fetchConnectedWallets(signal?: AbortSignal): Promise<{ items: Wallet[] }> {
  const { data } = await http.get<{ items: Wallet[] }>('/wallets/connected', { signal })
  return data
}

export async function fetchWallets(signal?: AbortSignal): Promise<WalletsResponse> {
  const { data } = await http.get<WalletsResponse>('/wallets', { signal })
  return data
}

export async function saveWallet(kind: WalletKind, input: WalletInput): Promise<WalletsResponse> {
  const { data } = await http.put<WalletsResponse>(`/wallets/${kind}`, input)
  return data
}

export async function setSecondarySameAsPrimary(value: boolean): Promise<WalletsResponse> {
  const { data } = await http.patch<WalletsResponse>('/wallets/settings', { secondarySameAsPrimary: value })
  return data
}
