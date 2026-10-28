import type { NftEdition } from '@/api/nfts'

interface EditionSelectorProps {
  editions: NftEdition[]
  value: string
  onChange: (id: string) => void
}

export function EditionSelector({ editions, value, onChange }: EditionSelectorProps) {
  return (
    <fieldset>
      <legend className="text-sm font-bold">Edição:</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {editions.map((edition) => {
          const soldOut = edition.available === 0
          return (
            <label
              key={edition.id}
              className={`rounded-full border px-3 py-1 text-xs has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-nav-active ${
                soldOut
                  ? 'cursor-not-allowed border-nav-tab/30 text-nav-tab/50 line-through'
                  : edition.id === value
                    ? 'cursor-pointer border-nav-active font-bold text-nav-active'
                    : 'cursor-pointer border-nav-tab/50 text-nav-tab hover:border-nav-active'
              }`}
            >
              <input
                type="radio"
                name="edition"
                className="sr-only"
                value={edition.id}
                checked={edition.id === value}
                disabled={soldOut}
                onChange={() => onChange(edition.id)}
              />
              {edition.label}
              {soldOut && <span className="sr-only"> (esgotada)</span>}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
