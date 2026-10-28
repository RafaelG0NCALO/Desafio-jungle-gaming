import { delay, http, HttpResponse } from 'msw'
import type { WalletInput, WalletKind } from '@/api/wallets'
import { authenticate } from '../db/authStore'
import { CONNECTED_WALLETS, loadWallets, saveWallets } from '../db/walletStore'

const ADDRESS = /^0x[a-fA-F0-9]{40}$/
const ENS = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i

const TAKEN_ADDRESS = `0x${'f'.repeat(40)}`

const fail = (status: number, code: string, message: string, errors?: Record<string, string>) =>
  HttpResponse.json({ code, message, errors }, { status })

export const walletHandlers = [
  http.get('/api/wallets/connected', async ({ request }) => {
    await delay(250)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    return HttpResponse.json({ items: CONNECTED_WALLETS })
  }),

  http.get('/api/wallets', async ({ request }) => {
    await delay(250)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    return HttpResponse.json(loadWallets(auth.user.id))
  }),

  http.put('/api/wallets/:kind', async ({ params, request }) => {
    await delay(400)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    const kind = params.kind as WalletKind
    if (kind !== 'primary' && kind !== 'secondary') return fail(404, 'not_found', 'Tipo de carteira inexistente.')

    const input = (await request.json()) as WalletInput
    const errors: Record<string, string> = {}
    if (!ADDRESS.test(input.address)) errors.address = 'Informe um endereço 0x válido (42 caracteres).'
    if (input.secondaryAddress && !ADDRESS.test(input.secondaryAddress) && !ENS.test(input.secondaryAddress)) {
      errors.secondaryAddress = 'Informe um endereço 0x ou um nome .eth válido.'
    }
    if (Object.keys(errors).length) return fail(422, 'validation_error', 'Revise os campos da carteira.', errors)

    const db = loadWallets(auth.user.id)
    const other = db.items.find((w) => w.kind !== kind)
    if (input.address.toLowerCase() === TAKEN_ADDRESS) {
      return fail(409, 'conflict', 'Este endereço já está cadastrado em outra conta.', { address: 'Este endereço já está cadastrado em outra conta.' })
    }
    if (other && other.address.toLowerCase() === input.address.toLowerCase()) {
      const where = other.kind === 'primary' ? 'principal' : 'secundária'
      return fail(409, 'conflict', `Este endereço já é a carteira ${where}.`, { address: `Este endereço já é a carteira ${where}.` })
    }

    const existing = db.items.find((w) => w.kind === kind)
    if (existing) Object.assign(existing, input)
    else db.items.push({ ...input, id: `wallet-${crypto.randomUUID().slice(0, 8)}`, kind, isDefault: false })
    if (kind === 'secondary') db.secondarySameAsPrimary = false
    saveWallets(auth.user.id, db)
    return HttpResponse.json(db)
  }),

  http.patch('/api/wallets/settings', async ({ request }) => {
    await delay(250)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    const { secondarySameAsPrimary } = (await request.json()) as { secondarySameAsPrimary: boolean }
    const db = loadWallets(auth.user.id)
    if (secondarySameAsPrimary && db.items.some((w) => w.kind === 'secondary')) {
      return fail(409, 'conflict', 'Remova a carteira secundária cadastrada antes de usar a principal nas duas posições.')
    }
    db.secondarySameAsPrimary = secondarySameAsPrimary
    saveWallets(auth.user.id, db)
    return HttpResponse.json(db)
  }),
]
