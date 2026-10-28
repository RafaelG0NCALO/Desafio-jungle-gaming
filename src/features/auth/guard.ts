import { redirect } from '@tanstack/react-router'
import type { ParsedLocation } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { sessionQueryOptions } from './session'

export async function requireAuth({ context, location }: { context: { queryClient: QueryClient }; location: ParsedLocation }) {
  const user = await context.queryClient.ensureQueryData(sessionQueryOptions())
  if (!user) throw redirect({ to: '/', search: { auth: 'login', redirect: location.href } })
}

export const isSafeRedirect = (value: string | undefined): value is string => !!value && value.startsWith('/') && !value.startsWith('//')
