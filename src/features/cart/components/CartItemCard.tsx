import { Trash2 } from 'lucide-react'
import type { CartItem } from '@/api/cart'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { formatEth } from '@/lib/eth'

interface CartItemCardProps {
  item: CartItem
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  removing: boolean
}

export function CartItemCard({ item, onQuantityChange, onRemove, removing }: CartItemCardProps) {
  return (
    <div className="flex items-stretch gap-3 lg:hidden">
      <img src={item.imageUrl} alt={item.imageAlt} width={96} height={96} loading="lazy" className="w-24 shrink-0 object-cover" />

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 py-3 pr-4">
        <div className="min-w-0">
          <h3 className="text-[15px] leading-tight font-bold">{item.name}</h3>
          <p className="mt-1 text-xs text-nav-tab">Edição: {item.edition.label}</p>
          <p className="mt-3 text-lg font-bold text-nav-active">{formatEth(item.lineTotal)} ETH</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <QuantityStepper compact value={item.quantity} max={item.maxQuantity} onChange={(q) => onQuantityChange(item.id, q)} />
          <button
            type="button"
            aria-label={`Remover ${item.name} do carrinho`}
            disabled={removing}
            onClick={() => onRemove(item.id)}
            className="rounded-sm p-1 text-nav-tab hover:text-nav-active focus-visible:outline-2 focus-visible:outline-nav-active disabled:cursor-not-allowed"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
