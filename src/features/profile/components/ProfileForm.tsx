import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiErrorMessage } from '@/api/cart'
import { fieldErrorsOf, type Profile } from '@/api/profile'
import { FormField, inputClass, PasswordInput, SelectInput } from '@/components/ui/FormField'
import { useChangePassword, useUpdateProfile } from '../hooks'
import { ENS_SUFFIXES, profileFormSchema, type ProfileFormValues } from '../schema'
import { AvatarField } from './AvatarField'

const toDefaults = (profile: Profile): ProfileFormValues => ({
  displayName: profile.displayName,
  username: profile.username,
  email: profile.email,
  ensSuffix: profile.ensSuffix,
  ensName: profile.ensName,
  walletNickname: profile.walletNickname,
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

function applyApiErrors(error: unknown, setError: UseFormSetError<ProfileFormValues>): boolean {
  const fields = fieldErrorsOf(error)
  if (!fields) return false
  let any = false
  for (const [name, message] of Object.entries(fields)) {
    if (name in toDefaults({} as Profile)) {
      setError(name as keyof ProfileFormValues, { message })
      any = true
    }
  }
  return any
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const form = useForm<ProfileFormValues>({ resolver: zodResolver(profileFormSchema), defaultValues: toDefaults(profile) })
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = form
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const saving = updateProfile.isPending || changePassword.isPending

  const a11y = (name: keyof ProfileFormValues) => ({
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  const onSubmit = handleSubmit(async (values) => {
    setStatus(null)
    const { currentPassword, newPassword, confirmNewPassword: _confirm, ...details } = values
    void _confirm
    try {
      const saved = await updateProfile.mutateAsync(details)
      if (newPassword) await changePassword.mutateAsync({ currentPassword, newPassword })
      reset(toDefaults(saved))
      setStatus({ kind: 'success', text: newPassword ? 'Dados e senha atualizados.' : 'Alterações salvas.' })
    } catch (error) {
      if (!applyApiErrors(error, setError)) {
        setStatus({ kind: 'error', text: apiErrorMessage(error, 'Não foi possível salvar. Tente novamente.') })
      } else {
        setStatus({ kind: 'error', text: 'Revise os campos destacados.' })
      }
    }
  })

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="profile-title">
      <h2 id="profile-title" className="text-sm font-bold">
        Perfil do colecionador
      </h2>

      <div className="mt-6 grid gap-x-6 gap-y-5 md:grid-cols-2">
        <FormField id="displayName" label="Nome de exibição" required error={errors.displayName?.message}>
          <input id="displayName" autoComplete="name" className={inputClass} {...a11y('displayName')} {...register('displayName')} />
        </FormField>

        <FormField id="username" label="Nome de usuário" required error={errors.username?.message}>
          <input id="username" autoComplete="username" className={inputClass} {...a11y('username')} {...register('username')} />
        </FormField>

        <FormField id="email" label="E-mail" required error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" className={inputClass} {...a11y('email')} {...register('email')} />
        </FormField>

        <FormField id="ensName" label="Nome ENS" required error={errors.ensName?.message ?? errors.ensSuffix?.message}>
          <div className="flex gap-2">
            <SelectInput id="ensSuffix" aria-label="Sufixo ENS" wrapperClassName="w-24 shrink-0" {...register('ensSuffix')}>
              {ENS_SUFFIXES.map((suffix) => (
                <option key={suffix} value={suffix}>
                  {suffix}
                </option>
              ))}
            </SelectInput>
            <input id="ensName" spellCheck={false} className={inputClass} {...a11y('ensName')} {...register('ensName')} />
          </div>
        </FormField>

        <FormField id="walletNickname" label="Apelido da carteira" required error={errors.walletNickname?.message}>
          <input id="walletNickname" className={inputClass} {...a11y('walletNickname')} {...register('walletNickname')} />
        </FormField>

        <AvatarField profile={profile} />
      </div>

      <fieldset className="mt-8 max-w-md">
        <legend className="mb-4 text-sm font-bold">Alterar senha</legend>
        <div className="flex flex-col gap-5">
          <FormField id="currentPassword" label="Senha atual" error={errors.currentPassword?.message}>
            <PasswordInput id="currentPassword" autoComplete="current-password" {...a11y('currentPassword')} {...register('currentPassword')} />
          </FormField>
          <FormField id="newPassword" label="Nova senha" error={errors.newPassword?.message}>
            <PasswordInput id="newPassword" autoComplete="new-password" {...a11y('newPassword')} {...register('newPassword')} />
          </FormField>
          <FormField id="confirmNewPassword" label="Confirmar nova senha" error={errors.confirmNewPassword?.message}>
            <PasswordInput id="confirmNewPassword" autoComplete="new-password" {...a11y('confirmNewPassword')} {...register('confirmNewPassword')} />
          </FormField>
        </div>
      </fieldset>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="h-9 rounded-md bg-nav-accent px-8 text-xs font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
        <p role="status" aria-live="polite" className={`text-xs ${status?.kind === 'error' ? 'text-nav-active' : 'text-nav-tab'}`}>
          {status?.text}
        </p>
      </div>
    </form>
  )
}
