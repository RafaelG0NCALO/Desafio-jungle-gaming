import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Socket } from 'socket.io-client'
import { isNftUpdated, isOrderUpdated } from '@/api/events'
import { createSocket } from '@/api/socket'
import { useSession } from '@/features/auth/session'
import { applyNftUpdated, applyOrderUpdated, reconcile, SeenEvents } from './apply'
import { clearNotices, pushNotice, setRealtimeConnected } from './store'

export function RealtimeProvider() {
  const queryClient = useQueryClient()
  const session = useSession()
  const sessionId = session.data?.id ?? null
  const ready = !session.isPending

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    let socket: Socket | undefined
    const events = new SeenEvents()
    let wasConnected = false

    createSocket().then((created) => {
      if (cancelled) return
      socket = created

      socket.on('connect', () => {
        setRealtimeConnected(true)
        clearNotices('connection')
        if (wasConnected) reconcile(queryClient)
        wasConnected = true
      })
      const lost = () => {
        setRealtimeConnected(false)
        if (wasConnected) pushNotice({ scope: 'connection', message: 'A conexão em tempo real caiu. Reconectando…' })
      }
      socket.on('disconnect', lost)
      socket.on('connect_error', lost)

      socket.on('nft.updated', (event: unknown) => {
        if (isNftUpdated(event) && !events.seen(event.id)) applyNftUpdated(queryClient, event)
      })
      socket.on('order.updated', (event: unknown) => {
        if (isOrderUpdated(event) && !events.seen(event.id)) applyOrderUpdated(queryClient, event)
      })

      socket.connect()
    })

    return () => {
      cancelled = true
      socket?.off()
      socket?.disconnect()
      setRealtimeConnected(false)
    }
  }, [queryClient, sessionId, ready])

  return null
}
