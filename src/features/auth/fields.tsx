import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export const fieldBase =
  'h-12 w-full rounded-lg border border-nav-accent/20 bg-background px-4 text-base leading-none text-nav-text outline-none placeholder:text-nav-accent/70 focus:border-nav-accent aria-invalid:border-nav-active'

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1 text-sm text-nav-active">
      {message}
    </p>
  )
}

interface PasswordInputProps extends Omit<ComponentProps<'input'>, 'type'> {
  id: string
  toggleable?: boolean
}

export function PasswordInput({ toggleable = false, className = '', ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className={`${fieldBase} ${toggleable ? 'pr-12' : ''} ${className}`}
        {...props}
      />
      {toggleable && (
        <button
          type="button"
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={show}
          onClick={() => setShow((v) => !v)}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-1 text-nav-accent focus-visible:outline-2 focus-visible:outline-nav-active"
        >
          {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </button>
      )}
    </div>
  )
}
