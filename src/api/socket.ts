import type { Socket } from 'socket.io-client'
import { getToken } from '@/lib/session'

export async function createSocket(): Promise<Socket> {
  const { io } = await import('socket.io-client')
  return io(import.meta.env.VITE_SOCKET_URL ?? '/', {
    autoConnect: false,
    path: '/socket.io',
    transports: ['websocket'],
    auth: (callback) => callback({ token: getToken() }),
    reconnectionDelay: 500,
    reconnectionDelayMax: 4000,
  })
}
