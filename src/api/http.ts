import axios, { isAxiosError } from 'axios'
import { getToken, getVisitorId } from '@/lib/session'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10_000,
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  config.headers.set('X-Visitor-Id', getVisitorId())
  return config
})

let onSessionExpired: (() => void) | undefined

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler
  return () => {
    if (onSessionExpired === handler) onSessionExpired = undefined
  }
}

http.interceptors.response.use(undefined, (error: unknown) => {
  if (
    isAxiosError<{ code?: string }>(error) &&
    error.response?.status === 401 &&
    error.response.data?.code === 'session_expired' &&
    !error.config?.url?.includes('/auth/session')
  ) {
    onSessionExpired?.()
  }
  return Promise.reject(error)
})
