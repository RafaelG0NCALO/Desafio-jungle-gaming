import { Link, useRouterState } from '@tanstack/react-router'
import { useSession } from '@/features/auth/session'
import { Heart, House, ScanLine, ShoppingCart, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type TabTarget = '/' | '/favoritos' | '/mercado' | '/carrinho' | '/login' | '/perfil'

interface TabItem {
  label: string
  to: TabTarget
  icon: LucideIcon
  filled?: boolean
}

const BASE_SLOTS: TabItem[] = [
  { label: 'Início', to: '/', icon: House, filled: true },
  { label: 'Favoritos', to: '/favoritos', icon: Heart, filled: true },
  { label: 'Escanear', to: '/mercado', icon: ScanLine },
  { label: 'Carrinho', to: '/carrinho', icon: ShoppingCart, filled: true },
  { label: 'Conta', to: '/login', icon: User, filled: true },
]

const tabClass =
  'grid h-18 w-full place-items-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-nav-active'

function Tab({ item, active }: { item: TabItem; active: boolean }) {
  const { label, to, icon: Icon, filled } = item
  const icon = (
    <Icon
      className={`size-6 transition-[translate,color] duration-500 ease-in-out motion-reduce:transition-none ${
        active ? '-translate-y-8 text-background delay-150' : 'text-nav-tab'
      }`}
      fill={filled ? 'currentColor' : 'none'}
      aria-hidden
    />
  )

  return (
    <Link
      to={to}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={tabClass}
    >
      {icon}
    </Link>
  )
}

export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { data: user } = useSession()
  const SLOTS = BASE_SLOTS.map((slot) => (slot.to === '/login' && user ? { ...slot, to: '/perfil' as const } : slot))
  const activeTarget = SLOTS.find((s) => s.to === pathname)?.to ?? null
  const activeIndex = SLOTS.findIndex((s) => s.to === activeTarget)

  return (
    <nav aria-label="Principal" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg lg:hidden">
      <ul className="relative grid h-18 grid-cols-5 rounded-4xl bg-surface shadow-lg shadow-black/40">
        {activeIndex >= 0 && (
          <li
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 z-0 flex h-full w-1/5 justify-center transition-transform duration-500 ease-in-out motion-reduce:transition-none"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            <span className="-mt-7 size-16 rounded-full border-[6px] border-background bg-linear-to-br from-nav-active to-nav-accent" />
          </li>
        )}

        {SLOTS.map((item, i) => (
          <li key={item.to} className="relative z-10">
            <Tab item={item} active={i === activeIndex} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
