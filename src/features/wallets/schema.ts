import { z } from 'zod'
import type { Wallet, WalletInput } from '@/api/wallets'

export { ENS_SUFFIXES, WALLET_TYPES } from '@/features/checkout/schema'

const ADDRESS = /^0x[a-fA-F0-9]{40}$/
const ENS = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i

export const walletFormSchema = z.object({
  displayName: z.string().trim().min(2, 'Informe o nome de exibição'),
  label: z.string().trim().min(2, 'Informe o apelido da carteira'),
  network: z.string().min(1, 'Selecione uma rede'),
  profileName: z.string().trim().min(2, 'Informe o nome do perfil'),
  address: z.string().trim().regex(ADDRESS, 'Informe um endereço 0x válido (42 caracteres)'),
  secondaryAddress: z
    .string()
    .trim()
    .refine((v) => v === '' || ADDRESS.test(v) || ENS.test(v), 'Informe um endereço 0x ou um nome .eth válido'),
  walletType: z.string().min(1, 'Selecione uma carteira'),
  referralCode: z.string().trim().min(3, 'Informe o código de indicação'),
  email: z.email('Informe um e-mail válido'),
  ensSuffix: z.string().min(1, 'Selecione o sufixo'),
  ensName: z
    .string()
    .trim()
    .refine((v) => v === '' || /^[a-z0-9.-]+$/i.test(v), 'Use apenas letras, números, ponto e hífen'),
})

export type WalletFormValues = z.infer<typeof walletFormSchema> & WalletInput

export const EMPTY_WALLET: WalletFormValues = {
  displayName: '',
  label: '',
  network: '',
  profileName: '',
  address: '',
  secondaryAddress: '',
  walletType: '',
  referralCode: '',
  email: '',
  ensSuffix: '.eth',
  ensName: '',
}

export const toWalletDefaults = (wallet?: Wallet): WalletFormValues =>
  wallet
    ? {
        displayName: wallet.displayName,
        label: wallet.label,
        network: wallet.network,
        profileName: wallet.profileName,
        address: wallet.address,
        secondaryAddress: wallet.secondaryAddress,
        walletType: wallet.walletType,
        referralCode: wallet.referralCode,
        email: wallet.email,
        ensSuffix: wallet.ensSuffix,
        ensName: wallet.ensName,
      }
    : EMPTY_WALLET
