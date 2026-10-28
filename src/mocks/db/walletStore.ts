import type { Wallet, WalletsResponse } from '@/api/wallets'

const STORAGE_KEY = 'kurio.mock.wallets'

const BASE = {
  displayName: 'Marina Costa',
  profileName: 'Marina',
  email: 'marina@email.com',
  secondaryAddress: '',
  referralCode: 'KURIO-1',
} as const

const SEED: WalletsResponse = { items: [], secondarySameAsPrimary: false }

export const CONNECTED_WALLETS: Wallet[] = [
  {
    ...BASE,
    id: 'wallet-reserva',
    kind: 'secondary',
    label: 'Reserva',
    network: 'polygon',
    address: `0x7B3C${'1'.repeat(32)}9D0A`,
    walletType: 'walletconnect',
    ensName: 'nova.kurio',
    ensSuffix: '.eth',
    isDefault: true,
  },
  {
    ...BASE,
    id: 'wallet-principal',
    kind: 'primary',
    label: 'Principal',
    network: 'ethereum',
    address: `0xA91F${'0'.repeat(32)}E82C`,
    walletType: 'metamask',
    ensName: '',
    ensSuffix: '.eth',
    isDefault: false,
  },
]

type WalletsDb = Record<string, WalletsResponse>

function load(): WalletsDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as WalletsDb
  } catch {
  }
  return {}
}

export function loadWallets(userId: string): WalletsResponse {
  return load()[userId] ?? structuredClone(SEED)
}

export function saveWallets(userId: string, wallets: WalletsResponse) {
  try {
    const db = load()
    db[userId] = wallets
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
  }
}

export function resetWallets() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
  }
}

export type { Wallet }
