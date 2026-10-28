import greenJacket from '@/assets/images/nft-green-jacket.webp'
import magnata from '@/assets/images/nft-magnata.webp'
import { PromoCard } from './PromoCard'

export function PromoCards() {
  return (
    <section aria-label="Destaques da Kurio" className="mx-auto max-w-360 px-4 pb-12 md:px-8 lg:px-16 lg:pb-16">
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <PromoCard
          imageSrc={greenJacket}
          imageAlt="Macaco de óculos escuros e jaqueta verde"
          title="Lançamentos gênesis de edição limitada"
          description="Colecione edições escassas diretamente dos criadores antes da revelação pública."
          link={{ to: '/mercado', search: { tab: 'new' } }}
        />
        <PromoCard
          imageSrc={magnata}
          imageAlt="Macaco de brinco dourado, gola alta verde e blazer bege"
          title="Arte digital selecionada e muito mais"
          description="Explore novos artistas, coleções verificadas e obras digitais que definem a nova era."
          link={{ to: '/mercado' }}
        />
      </div>
    </section>
  )
}
