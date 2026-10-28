import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { setSessionExpiredHandler } from '@/api/http'
import { clearToken } from '@/lib/session'
import { dropSessionData, sessionKey } from './session'

export function SessionWatcher() {
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    let handling = false
    return setSessionExpiredHandler(async () => {
      if (handling) return
      handling = true
      const returnTo = router.state.location.href
      clearToken()
      await dropSessionData(queryClient)
      queryClient.setQueryData(sessionKey, null)
      await router.navigate({ to: '/', search: { auth: 'login', redirect: returnTo, reason: 'expired' }, replace: true })
      handling = false
    })
  }, [queryClient, router])

  return null
}
