import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import { loadAuth } from '../db/authStore'
import { isBlocked, register } from './hub'

const socket = ws.link('*')

async function userOf(packet: string): Promise<string | null> {
  if (!packet.startsWith('40')) return null
  try {
    const { token } = JSON.parse(packet.slice(2) || '{}') as { token?: string }
    if (!token) return null
    const session = (await loadAuth()).sessions[token]
    return session && session.expiresAt > Date.now() ? session.userId : null
  } catch {
    return null
  }
}

export const realtimeHandlers = [
  socket.addEventListener('connection', (connection) => {
    if (!connection.client.url.pathname.startsWith('/socket.io/')) {
      connection.server.connect()
      return
    }

    if (isBlocked()) {
      connection.client.send('0' + JSON.stringify({ sid: 'recusada', upgrades: [], pingInterval: 25000, pingTimeout: 5000 }))
      setTimeout(() => connection.client.close(1011, 'indisponível'), 50)
      return
    }

    const { client } = toSocketIo(connection)
    const entry = {
      userId: null as string | null,
      send: (event: { type: string }) => client.emit(event.type, event),
      close: () => connection.client.close(1012, 'reinício'),
    }
    const unregister = register(entry)

    connection.client.addEventListener('message', async (message) => {
      if (typeof message.data === 'string') entry.userId = (await userOf(message.data)) ?? entry.userId
    })
    connection.client.addEventListener('close', unregister)
  }),
]
