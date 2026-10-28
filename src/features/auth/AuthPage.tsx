import { useEffect } from 'react'
import { Link, useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import { useIsDesktop } from '@/lib/useMediaQuery'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const isDesktop = useIsDesktop()
  const navigate = useNavigate()
  const router = useRouter()
  const { redirect, reason } = useSearch({ from: '__root__' })

  useEffect(() => {
    if (isDesktop) navigate({ to: '/', search: (prev) => ({ ...prev, auth: mode }), replace: true })
  }, [isDesktop, mode, navigate])

  if (isDesktop) return null

  const done = () => (redirect ? router.history.replace(redirect) : navigate({ to: '/' }))
  const isLogin = mode === 'login'

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <Link
        to="/"
        className="mt-6 self-center rounded-sm text-3xl leading-none font-bold tracking-[0.1em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nav-active"
      >
        KURIO
      </Link>

      {reason === 'expired' && (
        <p role="status" className="mt-8 rounded-md border border-nav-active/60 px-3 py-2 text-center text-xs text-nav-active">
          Sua sessão expirou. Entre novamente para continuar de onde parou.
        </p>
      )}

      <h1 className="mt-14 mb-8 text-center text-base font-bold">{isLogin ? 'Entrar' : 'Criar perfil de colecionador'}</h1>

      {isLogin ? (
        <LoginForm variant="page" onSuccess={done} />
      ) : (
        <SignupForm variant="page" submitLabel="Criar perfil" onSuccess={done} />
      )}

      <p className="mt-10 pb-4 text-center text-sm text-nav-tab">
        {isLogin ? 'Novo na Kurio? ' : 'Já tem uma conta? '}
        <Link
          to={isLogin ? '/cadastro' : '/login'}
          search={(prev) => prev}
          className="rounded-sm underline underline-offset-4 hover:text-nav-active focus-visible:outline-2 focus-visible:outline-nav-active"
        >
          {isLogin ? 'Crie uma conta' : 'Entre'}
        </Link>
      </p>
    </main>
  )
}
