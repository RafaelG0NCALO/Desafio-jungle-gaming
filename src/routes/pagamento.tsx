import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guard'
import { CheckoutSection } from '@/features/checkout/CheckoutSection'

export const Route = createFileRoute('/pagamento')({
  beforeLoad: requireAuth,
  component: () => (
    <main>
      <CheckoutSection />
    </main>
  ),
})
