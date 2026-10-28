import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  value: number
  max: number
  onChange: (value: number) => void
  compact?: boolean
}

export function QuantityStepper({ value, max, onChange, compact = false }: QuantityStepperProps) {
  const button = `grid place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:cursor-not-allowed disabled:opacity-40 ${
    compact ? 'size-6' : 'size-9'
  }`
  const icon = compact ? 'size-3' : 'size-4'

  return (
    <div>
      <div role="group" aria-label="Quantidade" className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
        <button
          type="button"
          aria-label="Diminuir quantidade"
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
          className={`${button} border-2 border-nav-accent text-nav-accent`}
        >
          <Minus className={icon} aria-hidden />
        </button>
        <output
          aria-live="polite"
          className={`grid place-items-center font-bold ${compact ? 'min-w-4 text-sm' : 'h-9 min-w-12 rounded-md bg-surface px-3 text-sm'}`}
        >
          {value}
        </output>
        <button
          type="button"
          aria-label="Aumentar quantidade"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={`${button} bg-nav-accent text-background`}
        >
          <Plus className={icon} aria-hidden />
        </button>
      </div>
      {value >= max && (
        <p role="status" className={compact ? 'sr-only' : 'mt-2 text-xs text-nav-active'}>
          {max === 1 ? 'Esta edição permite 1 unidade.' : `Limite de ${max} unidades para esta edição.`}
        </p>
      )}
    </div>
  )
}
