import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CatalogPaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const VISIBLE = 4

const base =
  'grid size-7 place-items-center rounded-md text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active'

export function CatalogPagination({ page, totalPages, onChange }: CatalogPaginationProps) {
  if (totalPages <= 1) return null

  const first = Math.min(Math.max(1, page - 1), Math.max(1, totalPages - VISIBLE + 1))
  const pages = Array.from({ length: Math.min(VISIBLE, totalPages) }, (_, i) => first + i)

  return (
    <nav aria-label="Paginação" className="flex justify-end">
      <ul className="flex items-center gap-2">
        {page > 1 && (
          <li>
            <button type="button" aria-label="Página anterior" onClick={() => onChange(page - 1)} className={`${base} bg-surface text-nav-text`}>
              <ChevronLeft className="size-4" aria-hidden />
            </button>
          </li>
        )}
        {pages.map((p) => (
          <li key={p}>
            <button
              type="button"
              aria-label={`Página ${p}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChange(p)}
              className={`${base} ${p === page ? 'bg-nav-accent font-bold text-background' : 'bg-surface text-nav-text hover:text-nav-active'}`}
            >
              {p}
            </button>
          </li>
        ))}
        {page < totalPages && (
          <li>
            <button type="button" aria-label="Próxima página" onClick={() => onChange(page + 1)} className={`${base} bg-surface text-nav-text`}>
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </li>
        )}
      </ul>
    </nav>
  )
}
