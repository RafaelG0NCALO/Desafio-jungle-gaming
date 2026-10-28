import { createFileRoute } from '@tanstack/react-router'
import { CartSection } from '@/features/cart/CartSection'

export const Route = createFileRoute('/carrinho')({
  component: () => (
    <main>
      <CartSection />
    </main>
  ),
})
