import { delay, http, HttpResponse } from 'msw'
import type { ConnectInput } from '@/api/walletConnection'
import { authenticate } from '../db/authStore'
import { clearConnection, loadConnection, saveConnection } from '../db/connectionStore'

const PROVIDERS = ['metamask', 'walletconnect', 'coinbase']
const NETWORKS = ['ethereum', 'polygon', 'solana']
const ADDRESS = /^0x[a-fA-F0-9]{40}$/

const fail = (status: number, code: string, message: string) => HttpResponse.json({ code, message }, { status })

export const connectionHandlers = [
  http.get('/api/wallet-connection', async ({ request }) => {
    await delay(200)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    return HttpResponse.json({ connection: loadConnection(auth.user.id) })
  }),

  http.post('/api/wallet-connection', async ({ request }) => {
    await delay(700)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    const input = (await request.json()) as ConnectInput
    if (!PROVIDERS.includes(input.provider) || !NETWORKS.includes(input.network) || !ADDRESS.test(input.address ?? '')) {
      return fail(422, 'validation_error', 'Informe a carteira, a rede e um endereço 0x válido para conectar.')
    }
    const connection = { ...input, connectedAt: new Date().toISOString() }
    saveConnection(auth.user.id, connection)
    return HttpResponse.json({ connection }, { status: 201 })
  }),

  http.delete('/api/wallet-connection', async ({ request }) => {
    await delay(200)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    clearConnection(auth.user.id)
    return new HttpResponse(null, { status: 204 })
  }),
]
