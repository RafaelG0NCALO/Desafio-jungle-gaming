import type { UseFormReturn } from 'react-hook-form'
import { NETWORKS } from '@/features/catalog/search'
import { ENS_SUFFIXES, WALLET_TYPES, type CheckoutValues } from '../schema'
import { FormField, inputClass, SelectInput } from '@/components/ui/FormField'

interface CollectorFormProps {
  form: UseFormReturn<CheckoutValues>
  onSubmit: () => void
  id: string
}

export function CollectorForm({ form, onSubmit, id }: CollectorFormProps) {
  const {
    register,
    formState: { errors },
  } = form

  const a11y = (name: keyof CheckoutValues) => ({
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  return (
    <form id={id} noValidate onSubmit={onSubmit} aria-labelledby="collector-title">
      <h2 id="collector-title" className="text-base font-bold">
        Perfil do colecionador
      </h2>

      <div className="mt-6 grid gap-x-6 gap-y-5 md:grid-cols-2">
        <FormField id="displayName" label="Nome de exibição" required error={errors.displayName?.message}>
          <input id="displayName" autoComplete="name" className={inputClass} {...a11y('displayName')} {...register('displayName')} />
        </FormField>

        <FormField id="username" label="Nome de usuário" required error={errors.username?.message}>
          <input id="username" autoComplete="username" className={inputClass} {...a11y('username')} {...register('username')} />
        </FormField>

        <FormField id="network" label="Rede" required error={errors.network?.message}>
          <SelectInput id="network" {...a11y('network')} {...register('network')}>
            <option value="">Selecione uma rede</option>
            {NETWORKS.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField id="profileName" label="Nome do perfil" required error={errors.profileName?.message}>
          <input id="profileName" className={inputClass} {...a11y('profileName')} {...register('profileName')} />
        </FormField>

        <FormField id="walletAddress" label="Endereço da carteira" required error={errors.walletAddress?.message}>
          <input
            id="walletAddress"
            autoComplete="off"
            spellCheck={false}
            placeholder="Endereço 0x da carteira"
            className={inputClass}
            {...a11y('walletAddress')}
            {...register('walletAddress')}
          />
        </FormField>

        <FormField id="secondaryWallet" label="Carteira secundária" error={errors.secondaryWallet?.message}>
          <input
            id="secondaryWallet"
            autoComplete="off"
            spellCheck={false}
            placeholder="ENS ou carteira secundária (opcional)"
            className={inputClass}
            {...a11y('secondaryWallet')}
            {...register('secondaryWallet')}
          />
        </FormField>

        <FormField id="walletType" label="Tipo de carteira" required error={errors.walletType?.message}>
          <SelectInput id="walletType" {...a11y('walletType')} {...register('walletType')}>
            <option value="">Selecione uma carteira</option>
            {WALLET_TYPES.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField id="referralCode" label="Código de indicação" required error={errors.referralCode?.message}>
          <input id="referralCode" autoComplete="off" className={inputClass} {...a11y('referralCode')} {...register('referralCode')} />
        </FormField>

        <FormField id="email" label="E-mail" required error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" className={inputClass} {...a11y('email')} {...register('email')} />
        </FormField>

        <FormField id="ensSuffix" label="Nome ENS" required error={errors.ensSuffix?.message}>
          <SelectInput id="ensSuffix" wrapperClassName="w-24" {...a11y('ensSuffix')} {...register('ensSuffix')}>
            {ENS_SUFFIXES.map((suffix) => (
              <option key={suffix} value={suffix}>
                {suffix}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <label className="mt-6 inline-flex cursor-pointer items-center gap-2 text-xs has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-nav-active">
        <input type="checkbox" className="size-4 accent-nav-accent" {...register('useOtherWallet')} />
        Usar outra carteira?
      </label>

      <FormField id="note" label="Observação do colecionador (opcional)" error={errors.note?.message} className="mt-6 max-w-sm">
        <textarea id="note" rows={5} className={`${inputClass} h-auto py-2`} {...a11y('note')} {...register('note')} />
      </FormField>
    </form>
  )
}
