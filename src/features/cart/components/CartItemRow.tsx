import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import type { CartItem } from '@/api/cart'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { formatEth } from '@/lib/eth'
import { CartItemCard } from './CartItemCard'

interface CartItemRowProps {
  item: CartItem
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  removing: boolean
}

export function CartItemRow({ item, onQuantityChange, onRemove, removing }: CartItemRowProps) {
  return (
    <li
      aria-busy={removing}
      className={`overflow-hidden rounded-xl bg-surface transition-opacity lg:rounded-lg ${removing ? 'opacity-50' : ''}`}
    >
      <CartItemCard item={item} onQuantityChange={onQuantityChange} onRemove={onRemove} removing={removing} />

      {item.quantity > item.maxQuantity && (
        <p role="alert" className="px-3 pb-3 text-xs text-nav-active">
          {item.maxQuantity === 0 ? 'Esta edição esgotou. Remova o item para continuar.' : `Só restam ${item.maxQuantity} ${item.maxQuantity === 1 ? 'unidade' : 'unidades'} desta edição. Reduza a quantidade para continuar.`}
        </p>
      )}

      <div className="hidden items-center gap-x-4 p-3 lg:grid lg:grid-cols-[minmax(0,2.4fr)_1fr_1fr_1fr_2rem]">
        <Link
          to="/nfts/$id"
          params={{ id: item.nftId }}
          className="flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
        >
          <img src={item.imageUrl} alt={item.imageAlt} width={48} height={48} loading="lazy" className="size-12 shrink-0 rounded-md object-cover" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{item.name}</span>
            <span className="block text-[11px] text-nav-tab">
              ID do token: {item.tokenId} · {item.edition.label}
            </span>
          </span>
        </Link>

        <p className="text-sm font-bold text-nav-active">{formatEth(item.unitPrice)} ETH</p>

        <QuantityStepper compact value={item.quantity} max={item.maxQuantity} onChange={(q) => onQuantityChange(item.id, q)} />

        <p className="text-sm font-bold text-nav-active">{formatEth(item.lineTotal)} ETH</p>

        <button
          type="button"
          aria-label={`Remover ${item.name} do carrinho`}
          disabled={removing}
          onClick={() => onRemove(item.id)}
          className="justify-self-end rounded-sm p-1 text-nav-tab hover:text-nav-active focus-visible:outline-2 focus-visible:outline-nav-active disabled:cursor-not-allowed"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  )
}
