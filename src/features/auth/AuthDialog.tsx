import { useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useIsDesktop } from '@/lib/useMediaQuery'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

export function AuthDialog() {
  const { auth, redirect, reason } = useSearch({ from: '__root__' })
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (auth && !isDesktop) {
      navigate({ to: auth === 'signup' ? '/cadastro' : '/login', search: (prev) => ({ ...prev, auth: undefined }), replace: true })
    }
  }, [auth, isDesktop, navigate])

  const setAuth = (next: 'login' | 'signup' | undefined) =>
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, auth: next, ...(next ? {} : { redirect: undefined, reason: undefined }) }),
      resetScroll: false,
    })

  const done = () => (redirect ? navigate({ href: redirect, replace: true }) : setAuth(undefined))

  const tab = 'rounded-sm px-3 text-xl leading-none focus-visible:outline-2 focus-visible:outline-nav-active'

  return (
    <Dialog open={!!auth && isDesktop} onOpenChange={(open) => !open && setAuth(undefined)}>
      <DialogContent>
        <DialogTitle className="sr-only">{auth === 'signup' ? 'Criar conta' : 'Entrar'}</DialogTitle>
        <div className="mb-6 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setAuth('login')}
            aria-current={auth === 'login' ? 'true' : undefined}
            className={`${tab} ${auth === 'login' ? 'font-bold text-nav-active' : 'text-nav-text'}`}
          >
            Entrar
          </button>
          <span aria-hidden className="h-5 w-px bg-nav-accent" />
          <button
            type="button"
            onClick={() => setAuth('signup')}
            aria-current={auth === 'signup' ? 'true' : undefined}
            className={`${tab} ${auth === 'signup' ? 'font-bold text-nav-active' : 'text-nav-text'}`}
          >
            Criar conta
          </button>
        </div>

        {reason === 'expired' && (
          <p role="status" className="mb-4 rounded-md border border-nav-active/60 px-3 py-2 text-center text-xs text-nav-active">
            Sua sessão expirou. Entre novamente para continuar de onde parou.
          </p>
        )}

        {auth === 'signup' ? (
          <>
            <DialogDescription className="mb-6 text-center text-sm">
              Crie seu perfil de colecionador e conecte uma carteira quando quiser.
            </DialogDescription>
            <SignupForm onSuccess={done} />
          </>
        ) : (
          <>
            <DialogDescription className="mb-6 text-center text-sm">
              Entre para gerenciar sua carteira, coleção e perfil de criador.
            </DialogDescription>
            <LoginForm onSuccess={done} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
