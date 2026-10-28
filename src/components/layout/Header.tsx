import { Link } from '@tanstack/react-router'
import { LogIn, Search, User } from 'lucide-react'
import { useSession } from '@/features/auth/session'
import { useCartCount } from '@/features/cart/hooks'
import cartIcon from '@/assets/icons/cart-icon.svg'

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Mercado', to: '/mercado' },
  { label: 'Criadores', to: '/criadores' },
  { label: 'Aprenda', to: '/aprenda' },
] as const

export function Header() {
  const cartCount = useCartCount()
  const { data: user } = useSession()
  const linkBase =
    'rounded-sm px-1 py-2 text-base leading-none font-normal tracking-normal text-nav-text transition-colors hover:text-nav-active focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nav-active'

  return (
    <header className="hidden mx-auto xl:px-16 px-8 bg-background lg:block max-w-360">
      <div className=" border-b border-nav-accent flex h-16 items-center justify-between gap-4  ">
        <Link
          to="/"
          className="rounded-sm text-[14px] leading-none font-bold tracking-widest text-nav-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nav-active"
        >
          KURIO
        </Link>

        <nav aria-label="Principal">
          <ul className="flex items-center gap-8 h-">
            {NAV_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: true }}
                  className={`${linkBase} relative`}
                  activeProps={{
                    className: `${linkBase} relative !font-bold !text-nav-active after:absolute after:inset-x-0 after:-bottom-3.5 after:h-1 after:bg-nav-active`,
                    'aria-current': 'page',
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Buscar"
            className="rounded-sm p-2 text-nav-text hover:text-nav-active focus-visible:outline-2 focus-visible:outline-nav-active"
          >
            <Search className="size-5" aria-hidden />
          </button>

          <Link
            to="/carrinho"
            aria-label={`Carrinho, ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
            className="relative rounded-sm p-2 text-nav-text hover:text-nav-active focus-visible:outline-2 focus-visible:outline-nav-active"
          >
            <img src={cartIcon} alt="" width={24} height={24} />
            <span
              aria-hidden
              className="absolute ring-4 ring-background top-1.5 -right-0.5 grid size-4 place-items-center rounded-full bg-nav-accent text-[10px] leading-none font-bold text-background"
            >
              {cartCount}
            </span>
          </Link>

          {user ? (
            <Link
              to="/perfil"
              className="inline-flex h-8.75 w-25 items-center justify-center gap-2.5 rounded-md bg-nav-accent text-base leading-none font-medium tracking-normal text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
            >
              <User className="size-4" aria-hidden />
              Perfil
            </Link>
          ) : (
            <Link
              to="."
              search={(prev) => ({ ...prev, auth: 'login' as const })}
              resetScroll={false}
              className="inline-flex h-8.75 w-25 items-center justify-center gap-2.5 rounded-md bg-nav-accent text-base leading-none font-medium tracking-normal text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
            >
              <LogIn className="size-4" aria-hidden />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
