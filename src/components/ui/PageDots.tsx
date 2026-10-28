interface PageDotsProps {
  count: number
  active: number
  onChange: (index: number) => void
  label: string
}

export function PageDots({ count, active, onChange, label }: PageDotsProps) {
  if (count <= 1) return null
  return (
    <div role="group" aria-label={label} className="flex justify-center">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Ir para a página ${i + 1} de ${count}`}
          aria-current={i === active ? 'true' : undefined}
          onClick={() => onChange(i)}
          className="grid size-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-nav-active"
        >
          <span
            className={`size-2.5 rounded-full border border-nav-accent transition-colors ${i === active ? 'bg-nav-accent' : 'bg-transparent'}`}
          />
        </button>
      ))}
    </div>
  )
}
