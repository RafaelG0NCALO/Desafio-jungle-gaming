import { useState } from 'react'
import Decimal from 'decimal.js'
import { PRICE_BOUNDS } from '../search'
import { PriceRange } from './PriceRange'

interface PriceRangeFilterProps {
  min?: string
  max?: string
  onApply: (min: string | undefined, max: string | undefined) => void
}

export function PriceRangeFilter({ min, max, onApply }: PriceRangeFilterProps) {
  const applied = { min: min ?? PRICE_BOUNDS.min, max: max ?? PRICE_BOUNDS.max }
  const [draft, setDraft] = useState(applied)

  const [seen, setSeen] = useState(`${applied.min}|${applied.max}`)
  if (seen !== `${applied.min}|${applied.max}`) {
    setSeen(`${applied.min}|${applied.max}`)
    setDraft(applied)
  }

  const apply = () =>
    onApply(
      new Decimal(draft.min).eq(PRICE_BOUNDS.min) ? undefined : new Decimal(draft.min).toFixed(2),
      new Decimal(draft.max).eq(PRICE_BOUNDS.max) ? undefined : new Decimal(draft.max).toFixed(2),
    )

  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold text-nav-text">Faixa de preço</legend>
      <PriceRange min={draft.min} max={draft.max} onChange={(a, b) => setDraft({ min: a, max: b })} />
      <button
        type="button"
        onClick={apply}
        className="mt-3 h-7 rounded-md bg-nav-accent px-3 text-xs font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
      >
        Aplicar
      </button>
    </fieldset>
  )
}
