import type { ReactNode } from 'react'
import { MobilePageBar } from '@/components/layout/MobilePageBar'
import { AccountNav } from './AccountNav'

interface AccountLayoutProps {
  title: string
  children: ReactNode
}

export function AccountLayout({ title, children }: AccountLayoutProps) {
  return (
    <>
      <MobilePageBar backFallback="/" title={title} />
      <div className="mx-auto grid max-w-360 gap-6 px-4 pb-8 md:px-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10 lg:px-16 lg:py-8">
        <aside>
          <AccountNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </>
  )
}
