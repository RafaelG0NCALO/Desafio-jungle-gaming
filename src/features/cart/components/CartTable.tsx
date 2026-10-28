import type { CartItem } from '@/api/cart'
import { CartItemRow } from './CartItemRow'
import { CartItemSkeleton } from './CartItemSkeleton'

interface CartTableProps {
  items?: CartItem[]
  isPending: boolean
  removingId?: string
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

const head = 'text-sm font-bold'

export function CartTable({ items, isPending, removingId, onQuantityChange, onRemove }: CartTableProps) {
  return (
    <div>
      <div aria-hidden className="hidden grid-cols-[minmax(0,2.4fr)_1fr_1fr_1fr_2rem] gap-x-4 border-b border-nav-accent/40 px-3 pb-3 lg:grid">
        <span className={head}>NFTs</span>
        <span className={head}>Preço</span>
        <span className={head}>Edições</span>
        <span className={head}>Total</span>
        <span />
      </div>

      <ul aria-label="Itens do carrinho" aria-busy={isPending} className="flex flex-col gap-3 lg:mt-3">
        {isPending
          ? Array.from({ length: 3 }, (_, i) => <CartItemSkeleton key={i} />)
          : items?.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onQuantityChange={onQuantityChange}
                onRemove={onRemove}
                removing={removingId === item.id}
              />
            ))}
      </ul>
    </div>
  )
}
