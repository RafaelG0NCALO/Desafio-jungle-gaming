export function CartItemSkeleton() {
  return (
    <li aria-hidden className="overflow-hidden rounded-xl bg-surface lg:rounded-lg">
      <div className="flex items-stretch gap-3 lg:hidden">
        <div className="skeleton h-24 w-24 shrink-0" />
        <div className="flex-1 py-3 pr-4">
          <div className="skeleton h-5 w-2/3 rounded" />
          <div className="skeleton mt-2 h-3 w-1/3 rounded" />
          <div className="skeleton mt-4 h-5 w-1/2 rounded" />
        </div>
      </div>
      <div className="hidden items-center gap-4 p-3 lg:grid lg:grid-cols-[minmax(0,2.4fr)_1fr_1fr_1fr_2rem]">
        <div className="flex items-center gap-3">
          <div className="skeleton size-12 rounded-md" />
          <div className="flex-1">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton mt-2 h-3 w-1/2 rounded" />
          </div>
        </div>
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-6 w-24 rounded-full" />
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton size-4 justify-self-end rounded" />
      </div>
    </li>
  )
}
