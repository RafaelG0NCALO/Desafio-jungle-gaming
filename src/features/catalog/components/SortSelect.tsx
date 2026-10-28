import { ChevronDown } from 'lucide-react'
import { SORTS, type SortValue } from '../search'

interface SortSelectProps {
  value: SortValue
  onChange: (value: SortValue) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-1 text-md">
      <label htmlFor="catalog-sort" className="text-nav-tab">
        Ordenar por:
      </label>
      <div className="relative">
        <select
          id="catalog-sort"
          value={value}
          onChange={(e) => onChange(e.target.value as SortValue)}
          className="cursor-pointer appearance-none rounded-sm bg-transparent py-1 pr-5 text-nav-text focus-visible:outline-2 focus-visible:outline-nav-active"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value} className="bg-surface">
              {s.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-nav-text" aria-hidden />
      </div>
    </div>
  )
}
