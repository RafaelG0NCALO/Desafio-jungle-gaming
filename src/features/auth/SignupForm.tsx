import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isAxiosError } from 'axios'
import type { SignupFieldErrors } from '@/api/auth'
import { useSignup } from './session'
import { FieldError, fieldBase, PasswordInput } from './fields'
import { SocialButtons } from './SocialButtons'

const schema = z
  .object({
    username: z.string().trim().min(3, 'Use pelo menos 3 caracteres'),
    email: z.email('Informe um e-mail válido'),
    password: z.string().min(8, 'Use pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  })
type FormValues = z.infer<typeof schema>

interface SignupFormProps {
  onSuccess: () => void
  variant?: 'dialog' | 'page'
  submitLabel?: string
}

export function SignupForm({ onSuccess, variant = 'dialog', submitLabel = 'Criar conta' }: SignupFormProps) {
  const [notice, setNotice] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useSignup()
  const onError = (error: unknown) => {
    if (isAxiosError<{ errors?: SignupFieldErrors }>(error) && [409, 422].includes(error.response?.status ?? 0)) {
      const fields = error.response?.data?.errors ?? {}
      for (const name of ['username', 'email', 'password'] as const) {
        const message = fields[name]
        if (message) setError(name, { message })
      }
    }
  }

  const genericError =
    mutation.error && !(isAxiosError(mutation.error) && [409, 422].includes(mutation.error.response?.status ?? 0))
      ? 'Não foi possível criar a conta agora. Tente novamente.'
      : ''

  return (
    <div className="flex flex-col">
      <form noValidate onSubmit={handleSubmit(({ username, email, password }) => mutation.mutate({ username, email, password }, { onSuccess, onError }))} className="flex flex-col gap-4">
        <div>
          <label htmlFor="signup-username" className="sr-only">
            Nome de usuário
          </label>
          <input
            id="signup-username"
            autoComplete="username"
            placeholder="Nome de usuário"
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? 'signup-username-error' : undefined}
            className={fieldBase}
            {...register('username')}
          />
          <FieldError id="signup-username-error" message={errors.username?.message} />
        </div>

        <div>
          <label htmlFor="signup-email" className="sr-only">
            E-mail
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="Digite seu e-mail"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
            className={fieldBase}
            {...register('email')}
          />
          <FieldError id="signup-email-error" message={errors.email?.message} />
        </div>

        <div>
          <label htmlFor="signup-password" className="sr-only">
            Senha
          </label>
          <PasswordInput
            id="signup-password"
            toggleable
            autoComplete="new-password"
            placeholder="Senha"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'signup-password-error' : undefined}
            {...register('password')}
          />
          <FieldError id="signup-password-error" message={errors.password?.message} />
        </div>

        <div>
          <label htmlFor="signup-confirm" className="sr-only">
            Confirmar senha
          </label>
          <PasswordInput
            id="signup-confirm"
            toggleable
            autoComplete="new-password"
            placeholder="Confirmar senha"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
            {...register('confirmPassword')}
          />
          <FieldError id="signup-confirm-error" message={errors.confirmPassword?.message} />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-2 h-12 w-full rounded-lg bg-nav-accent text-base leading-none font-bold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:opacity-60"
        >
          {mutation.isPending ? 'Criando conta…' : submitLabel}
        </button>
      </form>

      <div role="status" aria-live="polite" className="pt-2 text-center text-sm text-nav-active">
        {genericError || notice}
      </div>

      <SocialButtons bleed={variant === 'dialog'} onUnavailable={() => setNotice('Cadastro social indisponível nesta demonstração.')} />
    </div>
  )
}
