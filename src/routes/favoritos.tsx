import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guard'
import { FavoritesSection } from '@/features/favorites/FavoritesSection'

export const Route = createFileRoute('/favoritos')({
  beforeLoad: requireAuth,
  component: () => (
    <main>
      <FavoritesSection />
    </main>
  ),
})
