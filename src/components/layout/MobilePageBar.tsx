import type { ComponentProps, ReactNode } from 'react'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBarButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'grid size-10 place-items-center rounded-full border border-nav-accent/30 bg-surface text-nav-tab hover:text-nav-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active',
        className,
      )}
      {...props}
    />
  )
}

interface MobilePageBarProps {
  backFallback: LinkProps['to']
  trailing?: ReactNode
  title?: string
}

export function MobilePageBar({ backFallback, trailing, title }: MobilePageBarProps) {
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 px-4 py-4 md:px-8 lg:hidden">
      <MobileBarButton
        aria-label="Voltar"
        onClick={() => (canGoBack ? router.history.back() : navigate({ to: backFallback }))}
      >
        <ChevronLeft className="size-5" aria-hidden />
      </MobileBarButton>
      {title ? (
        <p aria-hidden className="truncate text-center text-lg font-bold md:text-xl">
          {title}
        </p>
      ) : (
        <span />
      )}
      <div className="justify-self-end">{trailing}</div>
    </div>
  )
}
