import { z } from 'zod'

export const WALLET_TYPES = [
  { value: 'metamask', label: 'MetaMask' },
  { value: 'walletconnect', label: 'WalletConnect' },
  { value: 'coinbase', label: 'Coinbase Wallet' },
] as const

export const ENS_SUFFIXES = ['.eth'] as const

const ADDRESS = /^0x[a-fA-F0-9]{40}$/
const ENS = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i

export const checkoutSchema = z.object({
  displayName: z.string().trim().min(2, 'Informe o nome de exibição'),
  username: z
    .string()
    .trim()
    .min(3, 'Use pelo menos 3 caracteres')
    .regex(/^[a-z0-9_]+$/i, 'Use apenas letras, números e _'),
  network: z.string().min(1, 'Selecione uma rede'),
  profileName: z.string().trim().min(2, 'Informe o nome do perfil'),
  walletAddress: z.string().trim().regex(ADDRESS, 'Informe um endereço 0x válido (42 caracteres)'),
  secondaryWallet: z
    .string()
    .trim()
    .refine((v) => v === '' || ADDRESS.test(v) || ENS.test(v), 'Informe um endereço 0x ou um nome .eth válido'),
  walletType: z.string().min(1, 'Selecione uma carteira'),
  referralCode: z.string().trim().min(3, 'Informe o código de indicação'),
  email: z.email('Informe um e-mail válido'),
  ensSuffix: z.string().min(1, 'Selecione o sufixo ENS'),
  useOtherWallet: z.boolean(),
  note: z.string().max(280, 'Use até 280 caracteres').optional(),
})

export type CheckoutValues = z.infer<typeof checkoutSchema>

export const CHECKOUT_DEFAULTS: CheckoutValues = {
  displayName: '',
  username: '',
  network: '',
  profileName: '',
  walletAddress: '',
  secondaryWallet: '',
  walletType: 'coinbase',
  referralCode: '',
  email: '',
  ensSuffix: '.eth',
  useOtherWallet: false,
  note: '',
}
