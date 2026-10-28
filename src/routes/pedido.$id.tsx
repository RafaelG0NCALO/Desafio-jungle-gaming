import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guard'
import { OrderConfirmationSection } from '@/features/order/OrderConfirmationSection'

function OrderRoute() {
  const { id } = Route.useParams()
  return (
    <main>
      <OrderConfirmationSection id={id} />
    </main>
  )
}

export const Route = createFileRoute('/pedido/$id')({
  beforeLoad: requireAuth,
  component: OrderRoute,
})
