import { LiveNotices } from '@/features/realtime/LiveNotices'
import { isOrderForbidden, isOrderNotFound, useOrder } from './hooks'
import { OrderDeclined, OrderForbidden, OrderLoadError, OrderNotFound, OrderPending, OrderSkeleton } from './components/OrderStates'
import { ReceiptCard } from './components/ReceiptCard'

export function OrderConfirmationSection({ id }: { id: string }) {
  const query = useOrder(id)

  let content
  if (query.isPending) {
    content = <OrderSkeleton />
  } else if (query.isError) {
    content = isOrderForbidden(query.error) ? (
      <OrderForbidden />
    ) : isOrderNotFound(query.error) ? (
      <OrderNotFound />
    ) : (
      <OrderLoadError onRetry={() => query.refetch()} />
    )
  } else if (query.data.status === 'confirmed') {
    content = <ReceiptCard order={query.data} />
  } else if (query.data.status === 'declined') {
    content = <OrderDeclined />
  } else {
    content = <OrderPending />
  }

  return (
    <section aria-busy={query.isPending} className="mx-auto max-w-360 px-4 py-8 md:px-8 lg:px-16 lg:py-12">
      <LiveNotices scopes={['order', 'connection']} resourceId={id} />
      {content}
    </section>
  )
}
