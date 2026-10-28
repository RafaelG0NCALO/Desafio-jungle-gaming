import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import type { Wallet } from '@/api/wallets'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { MobilePageBar } from '@/components/layout/MobilePageBar'
import { useOwner } from '@/features/auth/session'
import { useCart } from '@/features/cart/hooks'
import { LiveNotices } from '@/features/realtime/LiveNotices'
import { isConnectedTo, useWalletConnection } from '@/features/wallets/connection'
import { useCheckoutWallets } from '@/features/wallets/hooks'
import { useIsDesktop } from '@/lib/useMediaQuery'
import { CollectorForm } from './components/CollectorForm'
import { OrderSummary } from './components/OrderSummary'
import { RegisteredWallets } from './components/RegisteredWallets'
import { loadDraft, saveDraft } from './draft'
import { useCheckout } from './hooks'
import { CHECKOUT_DEFAULTS, checkoutSchema, type CheckoutValues } from './schema'

const FORM_ID = 'checkout-form'

export function CheckoutSection() {
  const cart = useCart()
  const wallets = useCheckoutWallets()
  const isDesktop = useIsDesktop()
  const owner = useOwner()
  const [draft] = useState(() => loadDraft(owner))
  const hadDraft = useRef(!!draft)
  const form = useForm<CheckoutValues>({ resolver: zodResolver(checkoutSchema), defaultValues: draft ?? CHECKOUT_DEFAULTS })

  useEffect(
    () => form.subscribe({ formState: { values: true }, callback: ({ values }) => saveDraft(owner, values as CheckoutValues) }),
    [form, owner],
  )

  const [provider, network, address] = useWatch({ control: form.control, name: ['walletType', 'network', 'walletAddress'] })
  const connection = useWalletConnection()
  const walletConnected = isConnectedTo(connection.data, { provider, network, address })
  const checkout = useCheckout(form, cart.data, walletConnected)

  const [pickedId, setPickedId] = useState<string>()
  const [notice, setNotice] = useState('')
  const selected = wallets.items?.find((w) => w.id === pickedId) ?? wallets.items?.find((w) => w.isDefault) ?? wallets.items?.[0]

  const applyWallet = (wallet: Wallet) => {
    form.setValue('network', wallet.network, { shouldValidate: form.formState.isSubmitted })
    form.setValue('walletAddress', wallet.address, { shouldValidate: form.formState.isSubmitted })
  }

  const selectedId = selected?.id
  const syncSelectedWallet = useEffectEvent(() => {
    if (selected && !isDesktop && !(hadDraft.current && !pickedId)) applyWallet(selected)
  })
  useEffect(() => {
    syncSelectedWallet()
  }, [selectedId, isDesktop])

  const emptyCart = cart.data && cart.data.items.length === 0

  return (
    <>
      <MobilePageBar backFallback="/carrinho" title="Pagamento com carteira" />
      <section aria-labelledby="checkout-title" className="mx-auto max-w-360 px-4 pb-28 md:px-8 lg:px-16 lg:py-8 lg:pb-8">
        <div className="hidden lg:block">
          <Breadcrumb
            items={[
              { label: 'Início', to: '/' },
              { label: 'Mercado', to: '/mercado' },
              { label: 'Pagamento', to: '/pagamento' },
            ]}
          />
        </div>
        <h1 id="checkout-title" className="sr-only">
          Pagamento
        </h1>

        <LiveNotices scopes={['cart', 'connection']} />

        {emptyCart ? (
          <div className="mt-6 flex flex-col items-center rounded-xl bg-surface px-6 py-16 text-center">
            <h2 className="text-base font-bold">Não há itens para pagar</h2>
            <p className="mt-2 max-w-sm text-sm text-nav-tab">Seu carrinho está vazio. Adicione NFTs para finalizar uma compra.</p>
            <Link
              to="/mercado"
              className="mt-6 inline-flex h-10 items-center rounded-md bg-nav-accent px-6 text-sm font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
            >
              Ir para o mercado
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-10 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <CollectorForm form={form} id={FORM_ID} onSubmit={checkout.submit} />
            <OrderSummary
              cart={cart.data}
              isPending={cart.isPending}
              walletType={provider}
              onWalletChange={(value) => form.setValue('walletType', value, { shouldValidate: true })}
              formId={FORM_ID}
              submitting={checkout.isPending}
              message={checkout.feedback.message || notice}
              changes={checkout.feedback.changes}
              needsCartFix={checkout.feedback.needsCartFix}
              walletChoice={{ provider, network, address }}
              walletsSlot={
                <RegisteredWallets
                  wallets={wallets.items}
                  isPending={wallets.isPending}
                  isError={wallets.isError}
                  selectedId={selected?.id}
                  onSelect={(wallet) => {
                    setNotice('')
                    setPickedId(wallet.id)
                    applyWallet(wallet)
                  }}
                  onRetry={() => wallets.refetch()}
                  onOptions={(wallet) => setNotice(`As opções da carteira ${wallet.label} ainda não estão disponíveis nesta demonstração.`)}
                />
              }
            />
          </div>
        )}
      </section>
    </>
  )
}
