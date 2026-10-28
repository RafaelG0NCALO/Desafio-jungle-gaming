import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface CheckboxGroupProps {
  legend: string
  name: string
  options: readonly Option[]
  selected: readonly string[]
  counts?: Record<string, number>
  onToggle: (value: string) => void
  rowClassName?: string
}

export function CheckboxGroup({ legend, name, options, selected, counts, onToggle, rowClassName }: CheckboxGroupProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-nav-text">{legend}</legend>
      <ul>
        {options.map((option) => {
          const id = `${name}-${option.value}`
          const checked = selected.includes(option.value)
          return (
            <li key={option.value}>
              <label
                htmlFor={id}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-xs has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-nav-active',
                  checked ? 'font-bold text-nav-active' : 'text-nav-tab hover:text-nav-active',
                  rowClassName,
                )}
              >
                <input
                  id={id}
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => onToggle(option.value)}
                />
                <span className="flex items-center gap-2">
                  {checked && <Check className="size-3" aria-hidden />}
                  {option.label}
                </span>
                {counts?.[option.value] !== undefined && (
                  <span className="font-bold text-nav-text">({counts[option.value]})</span>
                )}
              </label>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}
