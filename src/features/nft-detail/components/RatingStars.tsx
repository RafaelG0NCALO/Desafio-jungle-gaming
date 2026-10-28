import { Star } from 'lucide-react'

export function Stars({ value }: { value: number }) {
  const filled = Math.round(value)
  return (
    <span role="img" aria-label={`Nota ${value} de 5`} className="flex text-nav-active">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="size-4" fill={i < filled ? 'currentColor' : 'none'} aria-hidden />
      ))}
    </span>
  )
}

interface RatingStarsProps {
  average: number
  count: number
}

export function RatingStars({ average, count }: RatingStarsProps) {
  return (
    <p className="flex items-center gap-2 text-xs">
      <Stars value={average} />
      <span>{count} avaliações de colecionadores</span>
    </p>
  )
}
