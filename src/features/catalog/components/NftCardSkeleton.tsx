export function NftCardSkeleton() {
  return (
    <li aria-hidden>
      <div className="rounded-xl bg-surface p-3 pb-6">
        <div className="skeleton aspect-square w-full rounded-lg" />
      </div>
      <div className="skeleton mt-3 h-3 w-3/4 rounded" />
      <div className="skeleton mt-2 h-3 w-1/3 rounded" />
    </li>
  )
}
