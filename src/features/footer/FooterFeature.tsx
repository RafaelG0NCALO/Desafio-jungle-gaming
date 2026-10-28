interface FooterFeatureProps {
  mark: string
  title: string
  text: string
}

export function FooterFeature({ mark, title, text }: FooterFeatureProps) {
  return (
    <div className="flex items-start gap-4">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-full bg-nav-accent text-sm font-bold text-background"
      >
        {mark}
      </span>
      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-nav-tab">{text}</p>
      </div>
    </div>
  )
}
