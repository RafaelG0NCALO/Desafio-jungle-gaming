import Decimal from 'decimal.js'
import { PRICE_BOUNDS } from '../search'

const BOUND_MIN = new Decimal(PRICE_BOUNDS.min)
const BOUND_MAX = new Decimal(PRICE_BOUNDS.max)
const STEP = '0.01'

const formatEthRange = (v: string) => new Decimal(v).toFixed(2).replace('.', ',')

const thumb =
  'pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent focus-visible:outline-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-nav-accent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-nav-accent focus-visible:[&::-webkit-slider-thumb]:outline-2 focus-visible:[&::-webkit-slider-thumb]:outline-offset-2 focus-visible:[&::-webkit-slider-thumb]:outline-nav-active'

interface PriceRangeProps {
  min: string
  max: string
  onChange: (min: string, max: string) => void
}

export function PriceRange({ min, max, onChange }: PriceRangeProps) {
  const span = BOUND_MAX.minus(BOUND_MIN)
  const pct = (v: string) => new Decimal(v).minus(BOUND_MIN).div(span).times(100).toNumber()

  return (
    <div>
      <div className="relative mx-2 h-5">
        <div className="absolute top-1/2 h-0.5 w-full -translate-y-1/2 rounded bg-nav-accent/30" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded bg-nav-accent"
          style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }}
        />
        <input
          type="range"
          aria-label="Preço mínimo (ETH)"
          min={PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          step={STEP}
          value={min}
          onChange={(e) => onChange(Decimal.min(new Decimal(e.target.value), new Decimal(max)).toFixed(2), max)}
          className={thumb}
        />
        <input
          type="range"
          aria-label="Preço máximo (ETH)"
          min={PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          step={STEP}
          value={max}
          onChange={(e) => onChange(min, Decimal.max(new Decimal(e.target.value), new Decimal(min)).toFixed(2))}
          className={thumb}
        />
      </div>
      <p className="mt-3 text-xs" aria-live="polite">
        Preço: {formatEthRange(min)} - {formatEthRange(max)} ETH
      </p>
    </div>
  )
}
