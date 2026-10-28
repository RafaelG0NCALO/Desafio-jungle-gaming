import { CATALOG_TABS } from '../search'

interface CatalogTabsProps {
  value: 'new' | 'trending' | undefined
  onChange: (value: 'new' | 'trending' | undefined) => void
}

export function CatalogTabs({ value, onChange }: CatalogTabsProps) {
  return (
    <nav aria-label="Seções do catálogo">
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {CATALOG_TABS.map((tab) => {
          const active = tab.value === value
          return (
            <li key={tab.label}>
              <button
                type="button"
                aria-current={active ? 'true' : undefined}
                onClick={() => onChange(tab.value)}
                className={`relative rounded-sm py-1 text-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nav-active ${
                  active
                    ? 'font-bold text-nav-active after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-nav-active'
                    : 'text-nav-text hover:text-nav-active'
                }`}
              >
                {tab.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
