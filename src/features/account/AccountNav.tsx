import { useState } from 'react'
import type { ComponentType } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { useLogout } from '@/features/auth/session'
import { CircleAlert, Download, Heart, LogOut, MapPin, ShoppingCart, TrendingUp, User } from 'lucide-react'

interface AccountNavItem {
  label: string
  icon: ComponentType<{ className?: string }>
  to?: LinkProps['to']
}

const ITEMS: AccountNavItem[] = [
  { label: 'Dados do perfil', icon: User, to: '/perfil' },
  { label: 'Carteiras', icon: MapPin, to: '/carteiras' },
  { label: 'Atividade', icon: ShoppingCart },
  { label: 'Lista de interesse', icon: Heart, to: '/favoritos' },
  { label: 'Ofertas', icon: TrendingUp },
  { label: 'Arquivos baixados', icon: Download },
  { label: 'Suporte', icon: CircleAlert },
]

const itemClass =
  'relative flex w-full items-center gap-3 px-3 py-3 text-left text-xs text-nav-active hover:bg-background/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nav-active'

export function AccountNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [notice, setNotice] = useState('')
  const logout = useLogout()

  return (
    <nav aria-label="Minha conta" className="overflow-hidden rounded-md bg-surface">
      <h2 className="px-3 pt-3 pb-2 text-sm font-bold text-nav-text">Meu perfil</h2>
      <ul>
        {ITEMS.map(({ label, icon: Icon, to }) => {
          const active = to === pathname
          const content = (
            <>
              {active && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-nav-active" />}
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className={active ? 'font-bold' : undefined}>{label}</span>
            </>
          )
          return (
            <li key={label} className={active ? 'bg-background/40' : undefined}>
              {to ? (
                <Link to={to} aria-current={active ? 'page' : undefined} className={itemClass}>
                  {content}
                </Link>
              ) : (
                <button type="button" onClick={() => setNotice(`${label} ainda não está disponível nesta demonstração.`)} className={itemClass}>
                  {content}
                </button>
              )}
            </li>
          )
        })}
        <li className="border-t border-nav-accent/40">
          <button type="button" disabled={logout.isPending} onClick={() => logout.mutate()} className={`${itemClass} font-bold`}>
            <LogOut className="size-4 shrink-0" aria-hidden />
            Sair
          </button>
        </li>
      </ul>
      <p role="status" aria-live="polite" className={notice ? 'px-3 py-2 text-[11px] text-nav-active' : 'sr-only'}>
        {notice}
      </p>
    </nav>
  )
}
