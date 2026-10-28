import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guard'
import { ProfileSection } from '@/features/profile/ProfileSection'

export const Route = createFileRoute('/perfil')({
  beforeLoad: requireAuth,
  component: () => (
    <main>
      <ProfileSection />
    </main>
  ),
})
