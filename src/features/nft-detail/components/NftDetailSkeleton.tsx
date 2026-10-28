export function NftDetailSkeleton() {
  return (
    <div aria-hidden>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
          <div className="order-2 flex gap-3 lg:order-1 lg:flex-col">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="skeleton aspect-square w-1/4 rounded-lg lg:w-20"
              />
            ))}
          </div>
          <div className="skeleton order-1 aspect-square w-full flex-1 rounded-xl lg:order-2" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="skeleton h-9 w-2/3 rounded" />
          <div className="skeleton h-6 w-24 rounded" />
          <div className="skeleton h-px w-full" />
          <div className="skeleton h-20 w-full rounded" />
          <div className="skeleton h-7 w-48 rounded-full" />
          <div className="skeleton h-10 w-full max-w-sm rounded-md" />
          <div className="skeleton h-5 w-40 rounded" />
          <div className="skeleton h-5 w-56 rounded" />
        </div>
      </div>
      <div className="skeleton mt-10 h-[490px] rounded-xl md:h-[410px] lg:mt-12 lg:h-[345px]" />
      <div className="skeleton mt-10 h-[595px] rounded-xl md:h-[505px] lg:mt-12 lg:h-[420px]" />
    </div>
  );
}
