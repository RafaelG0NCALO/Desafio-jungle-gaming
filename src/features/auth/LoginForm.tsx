import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isAxiosError } from 'axios'
import { useLogin } from './session'
import { FieldError, fieldBase, PasswordInput } from './fields'
import { SocialButtons } from './SocialButtons'

const schema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe sua senha'),
})
type FormValues = z.infer<typeof schema>

export function LoginForm({ onSuccess, variant = 'dialog' }: { onSuccess: () => void; variant?: 'dialog' | 'page' }) {
  const [notice, setNotice] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useLogin()

  const apiError = mutation.error
    ? isAxiosError(mutation.error) && mutation.error.response?.status === 401
      ? 'E-mail ou senha incorretos.'
      : 'Não foi possível entrar agora. Tente novamente.'
    : ''

  return (
    <div className="flex flex-col">
      <form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values, { onSuccess }))} className="flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="sr-only">
            E-mail
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="contato@email.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className={fieldBase}
            {...register('email')}
          />
          <FieldError id="login-email-error" message={errors.email?.message} />
        </div>

        <div>
          <label htmlFor="login-password" className="sr-only">
            Senha
          </label>
          <PasswordInput
            id="login-password"
            toggleable
            autoComplete="current-password"
            placeholder="Senha"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            {...register('password')}
          />
          <FieldError id="login-password-error" message={errors.password?.message} />
        </div>

        <button
          type="button"
          onClick={() => setNotice('Recuperação de senha indisponível nesta demonstração.')}
          className="self-end rounded-sm text-sm text-nav-active hover:underline focus-visible:outline-2 focus-visible:outline-nav-active"
        >
          Esqueceu a senha?
        </button>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="h-12 w-full rounded-lg bg-nav-accent text-base leading-none font-bold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:opacity-60"
        >
          {mutation.isPending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div role="status" aria-live="polite" className="min-h-6 pt-2 text-center text-sm text-nav-active">
        {apiError || notice}
      </div>

      <SocialButtons bleed={variant === 'dialog'} onUnavailable={() => setNotice('Login social indisponível nesta demonstração.')} />
    </div>
  )
}
