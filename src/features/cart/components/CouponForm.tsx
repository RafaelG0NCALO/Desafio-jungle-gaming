import { useState } from 'react'
import type { FormEvent } from 'react'
import { apiErrorMessage } from '@/api/cart'
import { CouponRejected } from '@/api/quote'
import { useApplyCoupon, useRemoveCoupon } from '../hooks'

export function CouponForm({ appliedCode }: { appliedCode: string | null }) {
  const [code, setCode] = useState('')
  const apply = useApplyCoupon()
  const remove = useRemoveCoupon()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim() || apply.isPending) return
    apply.mutate(code, { onSuccess: () => setCode('') })
  }

  if (appliedCode) {
    return (
      <div>
        <p className="text-xs font-bold">Código promocional</p>
        <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-nav-accent/40 bg-background px-3 py-2 text-xs">
          <p role="status">
            Cupom <strong className="text-nav-active">{appliedCode}</strong> aplicado
          </p>
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
            className="rounded-sm text-nav-active underline focus-visible:outline-2 focus-visible:outline-nav-active disabled:opacity-50"
          >
            Remover
          </button>
        </div>
      </div>
    )
  }

  const error = apply.isError
    ? apply.error instanceof CouponRejected
      ? apply.error.message
      : apiErrorMessage(apply.error, 'Não foi possível validar o cupom. Tente novamente.')
    : ''

  return (
    <form noValidate onSubmit={submit}>
      <label htmlFor="coupon-code" className="sr-only text-xs font-bold lg:not-sr-only">
        Código promocional
      </label>
      <div className="flex h-12 items-center rounded-full border border-nav-accent/40 bg-background pl-4 focus-within:border-nav-accent lg:mt-2 lg:h-9 lg:rounded-md lg:pl-0">
        <input
          id="coupon-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            if (apply.isError) apply.reset()
          }}
          autoComplete="off"
          placeholder="Digite o código promocional..."
          aria-invalid={!!error}
          aria-describedby={error ? 'coupon-error' : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-nav-text outline-none placeholder:text-nav-accent/70 lg:px-3 lg:text-xs"
        />
        <button
          type="submit"
          disabled={apply.isPending}
          className="h-12 rounded-full bg-linear-to-r from-nav-active to-nav-accent px-6 text-sm font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:opacity-60 lg:h-9 lg:rounded-l-none lg:rounded-r-md lg:bg-none lg:bg-nav-accent lg:px-4 lg:text-xs"
        >
          {apply.isPending ? 'Aplicando…' : 'Aplicar'}
        </button>
      </div>
      {error && (
        <p id="coupon-error" role="alert" className="mt-2 text-xs text-nav-active">
          {error}
        </p>
      )}
    </form>
  )
}
