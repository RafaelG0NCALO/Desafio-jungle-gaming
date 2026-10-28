import type { CheckoutValues } from './schema'

const keyOf = (owner: string) => `kurio.draft.checkout.${owner}`

export function loadDraft(owner: string): CheckoutValues | null {
  try {
    const raw = sessionStorage.getItem(keyOf(owner))
    return raw ? (JSON.parse(raw) as CheckoutValues) : null
  } catch {
    return null
  }
}

export function saveDraft(owner: string, values: CheckoutValues) {
  try {
    sessionStorage.setItem(keyOf(owner), JSON.stringify(values))
  } catch {
  }
}

export function clearDraft(owner: string) {
  try {
    sessionStorage.removeItem(keyOf(owner))
  } catch {
  }
}
