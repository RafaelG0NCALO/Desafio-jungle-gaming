import { lazy, Suspense, useState } from 'react'
import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router'
import { Header } from '@/components/layout/Header'
import { MobileTopBar } from '@/components/layout/MobileTopBar'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { z } from 'zod'
import { RealtimeProvider } from '@/features/realtime/RealtimeProvider'
import { SessionWatcher } from '@/features/auth/SessionWatcher'
import { SiteFooter } from '@/features/footer/SiteFooter'
import { catalogSearchSchema } from '@/features/catalog/search'
import type { QueryClient } from '@tanstack/react-query'

const AuthDialog = lazy(() => import('@/features/auth/AuthDialog').then((m) => ({ default: m.AuthDialog })))

const rootSearchSchema = catalogSearchSchema.extend({
  auth: z.enum(['login', 'signup']).optional().catch(undefined),
  reason: z.enum(['expired']).optional().catch(undefined),
  redirect: z
    .string()
    .refine((v) => v.startsWith('/') && !v.startsWith('//'))
    .optional()
    .catch(undefined),
})

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const authOpen = useRouterState({ select: (s) => !!(s.location.search as { auth?: string }).auth })
  const [authLoaded, setAuthLoaded] = useState(false)
  if (authOpen && !authLoaded) setAuthLoaded(true)
  const isAuthPage = pathname === '/login' || pathname === '/cadastro'
  const isNftDetail = pathname.startsWith('/nfts/')
  const isCart = pathname === '/carrinho'
  const isCheckout = pathname === '/pagamento' || pathname.startsWith('/pedido/')
  const isAccount = pathname === '/perfil' || pathname === '/carteiras'
  const hasOwnTopBar = isNftDetail || isCart || isCheckout || isAccount

  return (
    <>
      <Header />
      {!isAuthPage && !hasOwnTopBar && <MobileTopBar />}
      <div className={isAuthPage ? undefined : isNftDetail ? 'pb-44 lg:pb-0' : isCart ? 'pb-96 lg:pb-0' : isCheckout ? undefined : 'pb-28 lg:pb-0'}>
        <Outlet />
        {!isAuthPage && <SiteFooter />}
      </div>
      {!isAuthPage && !isNftDetail && !isCart && !isCheckout && <MobileTabBar />}
      {authLoaded && (
        <Suspense fallback={null}>
          <AuthDialog />
        </Suspense>
      )}
      <SessionWatcher />
      <RealtimeProvider />
    </>
  )
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  validateSearch: (search: Record<string, unknown>) => rootSearchSchema.parse(search),
  component: RootLayout,
  notFoundComponent: () => <main className="p-4"><h1>Página não encontrada</h1></main>,
})
