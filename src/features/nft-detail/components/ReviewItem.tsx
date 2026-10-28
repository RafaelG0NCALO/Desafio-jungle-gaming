import type { NftReview } from '@/api/nfts'
import { Stars } from './RatingStars'

const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export function ReviewItem({ review }: { review: NftReview }) {
  return (
    <li className="rounded-xl bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-bold">{review.author}</p>
        <Stars value={review.rating} />
      </div>
      <p className="mt-1 text-[11px] text-nav-tab/80">
        <time dateTime={review.createdAt}>{dateFormat.format(new Date(review.createdAt))}</time>
      </p>
      <p className="mt-3 text-xs leading-relaxed text-nav-tab">{review.comment}</p>
    </li>
  )
}
