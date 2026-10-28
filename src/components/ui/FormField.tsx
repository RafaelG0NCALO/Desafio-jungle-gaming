import { useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export const inputClass =
  'h-10 w-full rounded-md border border-nav-accent/20 bg-surface px-3 text-xs text-nav-text outline-none placeholder:text-nav-accent/70 focus:border-nav-accent aria-invalid:border-nav-active'

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({ id, label, required, error, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-xs">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-nav-active">
            *
          </span>
        )}
        {required && <span className="sr-only"> (obrigatório)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-nav-active">
          {error}
        </p>
      )}
    </div>
  )
}

export function SelectInput({ className, wrapperClassName, children, ...props }: ComponentProps<'select'> & { wrapperClassName?: string }) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <select className={cn(inputClass, 'cursor-pointer appearance-none pr-8', className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-nav-accent" aria-hidden />
    </div>
  )
}

export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} className={cn(inputClass, 'pr-10', className)} {...props} />
      <button
        type="button"
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={show}
        onClick={() => setShow((v) => !v)}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-sm text-nav-accent focus-visible:outline-2 focus-visible:outline-nav-active"
      >
        {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  )
}
