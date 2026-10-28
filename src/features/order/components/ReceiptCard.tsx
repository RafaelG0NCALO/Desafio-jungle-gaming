import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import type { Order } from '@/api/orders'
import { NETWORKS } from '@/features/catalog/search'
import { WALLET_TYPES } from '@/features/checkout/schema'
import { formatEth } from '@/lib/eth'
import paymentIcon from '@/assets/icons/payment.svg'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatReceiptDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

const shortRef = (ref: string) => `${ref.slice(0, 6)}…${ref.slice(-4)}`

const EXPLORERS: Record<string, { name: string; url: string }> = {
  ethereum: { name: 'Etherscan', url: 'https://etherscan.io/tx/' },
  polygon: { name: 'Polygonscan', url: 'https://polygonscan.com/tx/' },
  solana: { name: 'Solscan', url: 'https://solscan.io/tx/' },
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] text-nav-tab">{label}</dt>
      <dd className="mt-1 text-xs font-bold">{value}</dd>
    </div>
  )
}

export function ReceiptCard({ order }: { order: Order }) {
  const network = NETWORKS.find((n) => n.value === order.wallet.network)?.label ?? order.wallet.network
  const wallet = WALLET_TYPES.find((w) => w.value === order.wallet.type)?.label ?? order.wallet.type
  const explorer = EXPLORERS[order.wallet.network] ?? EXPLORERS.ethereum

  return (
    <article aria-labelledby="receipt-title" className="relative mx-auto w-full max-w-lg border-b-4 border-nav-accent bg-surface">
      <Link
        to="/mercado"
        aria-label="Fechar e voltar ao mercado"
        className="absolute top-3 right-3 rounded-sm p-1 text-nav-active hover:opacity-80 focus-visible:outline-2 focus-visible:outline-nav-active"
      >
        <X className="size-4" aria-hidden />
      </Link>

      <header className="flex flex-col items-center px-6 pt-6 pb-4 text-center">
        <img src={paymentIcon} alt="" width={66} height={80} />
        <h1 id="receipt-title" className="mt-3 text-sm font-bold text-nav-active">
          Seus NFTs agora estão na sua carteira
        </h1>
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-nav-accent/60 px-6 py-3 sm:grid-cols-4">
        <Meta label="ID da transação" value={shortRef(order.transactionRef)} />
        <Meta label="Data" value={formatReceiptDate(order.createdAt)} />
        <Meta label="Total" value={`${formatEth(order.quote.total)} ETH`} />
        <Meta label="Carteira" value={wallet} />
      </dl>

      <section aria-labelledby="receipt-details" className="px-6 py-5">
        <h2 id="receipt-details" className="text-xs font-bold">
          Detalhes da transação
        </h2>

        <div aria-hidden className="mt-3 grid grid-cols-[minmax(0,1fr)_3rem_5.5rem] gap-x-4 border-b border-nav-accent/40 pb-2 text-[10px] font-bold">
          <span>NFTs</span>
          <span className="text-center">Edições</span>
          <span className="text-right">Subtotal</span>
        </div>

        <ul aria-label="NFTs comprados" className="mt-3 flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={`${item.nftId}-${item.editionLabel}`} className="grid grid-cols-[minmax(0,1fr)_3rem_5.5rem] items-center gap-x-4">
              <div className="flex min-w-0 items-center gap-3">
                <img src={item.imageUrl} alt={item.imageAlt} width={40} height={40} loading="lazy" className="size-10 shrink-0 rounded object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{item.name}</p>
                  <p className="text-[10px] text-nav-tab">ID do token: {item.tokenId}</p>
                </div>
              </div>
              <p className="text-center text-[11px] text-nav-tab">
                <span className="sr-only">Quantidade: </span>(x {item.quantity})
              </p>
              <p className="text-right text-xs font-bold text-nav-active">{formatEth(item.lineTotal)} ETH</p>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-2 text-xs">
          <div className="flex justify-end gap-6">
            <dt className="text-nav-tab">Taxa de rede</dt>
            <dd className="w-24 text-right">{formatEth(order.quote.networkFee)} ETH</dd>
          </div>
          <div className="flex justify-end gap-6 font-bold">
            <dt>Total</dt>
            <dd className="w-24 text-right text-nav-active">{formatEth(order.quote.total)} ETH</dd>
          </div>
        </dl>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-nav-tab">
          Transação confirmada na {network}. A propriedade foi transferida para sua carteira conectada e registrada na rede.
        </p>

        <div className="mt-5 flex justify-center">
          <a
            href={`${explorer.url}${order.transactionRef}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center rounded-md bg-nav-accent px-5 text-xs font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
          >
            Ver no {explorer.name}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </div>
      </section>
    </article>
  )
}
