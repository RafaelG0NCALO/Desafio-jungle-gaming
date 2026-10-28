import { useState } from 'react'
import type { FormEvent } from 'react'
import { z } from 'zod'

const emailSchema = z.email('Informe um e-mail válido')

export function NewsletterForm({ onUnavailable }: { onUnavailable: () => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const result = emailSchema.safeParse(email.trim())
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    setError('')
    onUnavailable()
  }

  return (
    <form noValidate onSubmit={submit} aria-labelledby="newsletter-title">
      <h3 id="newsletter-title" className="text-sm font-bold">
        Antecipe-se ao próximo lançamento
      </h3>
      <div className="mt-3 flex">
        <label htmlFor="newsletter-email" className="sr-only">
          E-mail
        </label>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="digite seu e-mail..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? 'newsletter-error' : undefined}
          className="h-9 min-w-0 flex-1 rounded-l-md border border-nav-accent/30 bg-background px-3 text-xs text-nav-text outline-none placeholder:text-nav-accent/70 focus:border-nav-accent"
        />
        <button
          type="submit"
          className="h-9 rounded-r-md bg-nav-accent px-4 text-xs font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
        >
          Enviar
        </button>
      </div>
      {error && (
        <p id="newsletter-error" className="mt-1 text-xs text-nav-active">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-nav-tab">
        Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
      </p>
    </form>
  )
}
