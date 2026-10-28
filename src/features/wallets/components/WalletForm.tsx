import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiErrorMessage } from '@/api/cart'
import { fieldErrorsOf } from '@/api/profile'
import type { Wallet, WalletKind } from '@/api/wallets'
import { FormField, inputClass, SelectInput } from '@/components/ui/FormField'
import { NETWORKS } from '@/features/catalog/search'
import { useSaveWallet } from '../hooks'
import { ENS_SUFFIXES, WALLET_TYPES, toWalletDefaults, walletFormSchema, type WalletFormValues } from '../schema'

interface WalletFormProps {
  kind: WalletKind
  wallet?: Wallet
  onSaved?: () => void
}

export function WalletForm({ kind, wallet, onSaved }: WalletFormProps) {
  const form = useForm<WalletFormValues>({ resolver: zodResolver(walletFormSchema), defaultValues: toWalletDefaults(wallet) })
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = form
  const save = useSaveWallet(kind)
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const id = (name: string) => `${kind}-${name}`
  const a11y = (name: keyof WalletFormValues) => ({
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${id(name)}-error` : undefined,
  })

  const onSubmit = handleSubmit((values) => {
    setStatus(null)
    save.mutate(values, {
      onSuccess: (data) => {
        const saved = data.items.find((w) => w.kind === kind)
        reset(toWalletDefaults(saved))
        setStatus({ kind: 'success', text: 'Carteira salva.' })
        onSaved?.()
      },
      onError: (error) => {
        const fields = fieldErrorsOf(error)
        let mapped = false
        for (const [name, message] of Object.entries(fields ?? {})) {
          if (name in values) {
            setError(name as keyof WalletFormValues, { message })
            mapped = true
          }
        }
        setStatus({ kind: 'error', text: mapped ? 'Revise os campos destacados.' : apiErrorMessage(error, 'Não foi possível salvar a carteira. Tente novamente.') })
      },
    })
  })

  return (
    <form noValidate onSubmit={onSubmit} aria-label={kind === 'primary' ? 'Carteira principal' : 'Carteira secundária'}>
      <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
        <FormField id={id('displayName')} label="Nome de exibição" required error={errors.displayName?.message}>
          <input id={id('displayName')} autoComplete="name" className={inputClass} {...a11y('displayName')} {...register('displayName')} />
        </FormField>

        <FormField id={id('label')} label="Apelido da carteira" required error={errors.label?.message}>
          <input id={id('label')} className={inputClass} {...a11y('label')} {...register('label')} />
        </FormField>

        <FormField id={id('network')} label="Rede" required error={errors.network?.message}>
          <SelectInput id={id('network')} {...a11y('network')} {...register('network')}>
            <option value="">Selecione uma rede</option>
            {NETWORKS.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField id={id('profileName')} label="Nome do perfil" required error={errors.profileName?.message}>
          <input id={id('profileName')} className={inputClass} {...a11y('profileName')} {...register('profileName')} />
        </FormField>

        <FormField id={id('address')} label="Endereço da carteira" required error={errors.address?.message}>
          <input
            id={id('address')}
            autoComplete="off"
            spellCheck={false}
            placeholder="Endereço 0x da carteira"
            className={inputClass}
            {...a11y('address')}
            {...register('address')}
          />
        </FormField>

        <FormField id={id('secondaryAddress')} label="Carteira secundária" error={errors.secondaryAddress?.message}>
          <input
            id={id('secondaryAddress')}
            autoComplete="off"
            spellCheck={false}
            placeholder="ENS ou carteira secundária (opcional)"
            className={inputClass}
            {...a11y('secondaryAddress')}
            {...register('secondaryAddress')}
          />
        </FormField>

        <FormField id={id('walletType')} label="Tipo de carteira" required error={errors.walletType?.message}>
          <SelectInput id={id('walletType')} {...a11y('walletType')} {...register('walletType')}>
            <option value="">Selecione uma carteira</option>
            {WALLET_TYPES.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField id={id('referralCode')} label="Código de indicação" required error={errors.referralCode?.message}>
          <input id={id('referralCode')} autoComplete="off" className={inputClass} {...a11y('referralCode')} {...register('referralCode')} />
        </FormField>

        <FormField id={id('email')} label="E-mail" required error={errors.email?.message}>
          <input id={id('email')} type="email" autoComplete="email" className={inputClass} {...a11y('email')} {...register('email')} />
        </FormField>

        <FormField id={id('ensName')} label="Nome ENS" error={errors.ensName?.message ?? errors.ensSuffix?.message}>
          <div className="flex gap-2">
            <SelectInput id={id('ensSuffix')} aria-label="Sufixo ENS" wrapperClassName="w-24 shrink-0" {...register('ensSuffix')}>
              {ENS_SUFFIXES.map((suffix) => (
                <option key={suffix} value={suffix}>
                  {suffix}
                </option>
              ))}
            </SelectInput>
            <input id={id('ensName')} spellCheck={false} className={inputClass} {...a11y('ensName')} {...register('ensName')} />
          </div>
        </FormField>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={save.isPending}
          className="h-9 rounded-md bg-nav-accent px-5 text-xs font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {save.isPending ? 'Salvando…' : 'Salvar carteira'}
        </button>
        <p role="status" aria-live="polite" className={`text-xs ${status?.kind === 'error' ? 'text-nav-active' : 'text-nav-tab'}`}>
          {status?.text}
        </p>
      </div>
    </form>
  )
}
