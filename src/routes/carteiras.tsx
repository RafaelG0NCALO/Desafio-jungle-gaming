import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guard'
import { WalletsSection } from '@/features/wallets/WalletsSection'

export const Route = createFileRoute('/carteiras')({
  beforeLoad: requireAuth,
  component: () => (
    <main>
      <WalletsSection />
    </main>
  ),
})
