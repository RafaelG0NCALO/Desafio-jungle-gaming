import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'

interface BreadcrumbItem {
  label: string
  to: LinkProps['to']
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Navegação estrutural" className="text-xs">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            <Link
              to={item.to}
              className="rounded-sm hover:text-nav-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
