import type { Nft, NftDetail, NftReview } from '@/api/nfts'
import { COLLECTIONS, NETWORKS } from '@/features/catalog/search'
import greenJacket from '@/assets/images/nft-green-jacket.webp'
import hat from '@/assets/images/nft-hat.webp'
import headset from '@/assets/images/nft-headset.webp'
import magnata from '@/assets/images/nft-magnata.webp'

const IMAGES = [
  { url: greenJacket, alt: 'Macaco de óculos escuros e jaqueta verde' },
  { url: hat, alt: 'Macaco cinza de chapéu verde e moletom roxo' },
  { url: magnata, alt: 'Macaco de brinco dourado, gola alta verde e blazer bege' },
  { url: headset, alt: 'Macaco laranja de fones verdes e jaqueta bege' },
]

const SEEDED = [
  { name: 'Emerald Ape #042', price: '1.19', previous: null, image: 0 },
  { name: 'Sage Nomad #009', price: '1.69', previous: null, image: 1 },
  { name: 'Neon Vessel #552', price: '1.99', previous: '2.29', image: 2 },
  { name: 'Cosmic Bloom #118', price: '1.29', previous: null, image: 1 },
  { name: 'Violet Nomad #314', price: '1.39', previous: null, image: 1 },
  { name: 'Ivory Baron #088', price: '1.79', previous: null, image: 2 },
  { name: 'Golden Beat #207', price: '0.99', previous: null, image: 3 },
  { name: 'Golden Echo #175', price: '0.69', previous: null, image: 3 },
  { name: 'Golden Signal #160', price: '0.39', previous: null, image: 3 },
]

const ADJECTIVES = ['Emerald', 'Sage', 'Neon', 'Cosmic', 'Violet', 'Ivory', 'Golden', 'Crimson', 'Azure', 'Amber', 'Onyx', 'Lunar']
const NOUNS = ['Ape', 'Nomad', 'Vessel', 'Bloom', 'Baron', 'Beat', 'Signal', 'Echo']

const TOTAL = 48
const DAY = 86_400_000
const NEWEST = Date.UTC(2026, 9, 25)

export const NFT_FIXTURES: Nft[] = Array.from({ length: TOTAL }, (_, i) => {
  const seeded = SEEDED[i]
  const image = IMAGES[seeded?.image ?? i % IMAGES.length]
  const name =
    seeded?.name ?? `${ADJECTIVES[i % ADJECTIVES.length]} ${NOUNS[(i * 3) % NOUNS.length]} #${String(((i * 79) % 900) + 100)}`
  const price = seeded?.price ?? (0.02 + ((i * 37) % 1228) / 100).toFixed(2)
  const total = 5 + ((i * 7) % 20)
  return {
    id: `nft-${String(i + 1).padStart(3, '0')}`,
    version: 1,
    name,
    imageUrl: image.url,
    imageAlt: `${name}: ${image.alt}`,
    price,
    previousPrice: seeded ? seeded.previous : i % 11 === 0 ? (Number(price) * 1.2).toFixed(2) : null,
    badge: i === 2 || i % 6 === 4 ? 'rare' : null,
    collection: COLLECTIONS[i % COLLECTIONS.length].value,
    network: NETWORKS[(i * 5 + Math.floor(i / 9)) % NETWORKS.length].value,
    likes: (i * 53) % 400,
    listedAt: new Date(NEWEST - i * 2 * DAY).toISOString(),
    edition: { available: i % 13 === 5 ? 0 : 1 + (i % total), total },
  }
})

export const FEATURED_NFT_ID = 'nft-002'

const DESCRIPTION =
  'Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.'

export function buildNftDetail(nft: Nft): NftDetail {
  const index = NFT_FIXTURES.findIndex((n) => n.id === nft.id)
  const digits = nft.name.match(/#(\d+)/)?.[1] ?? String(index + 1)
  const soldOut = nft.edition.available === 0
  return {
    ...nft,
    description: DESCRIPTION,
    gallery: Array.from({ length: 4 }, (_, i) => ({ url: nft.imageUrl, alt: `${nft.name}, vista ${i + 1} de 4` })),
    editions: [
      { id: '1-1', label: '1/1', available: index % 4 === 1 ? 0 : 1, maxPerOrder: 1 },
      { id: '1-10', label: '1/10', available: index % 3 === 1 ? 0 : 10, maxPerOrder: 3 },
      { id: '1-50', label: '1/50', available: soldOut ? 0 : nft.edition.available + 12, maxPerOrder: 5 },
      { id: 'open', label: 'ABERTA', available: null, maxPerOrder: 10 },
    ],
    defaultEditionId: '1-50',
    rating: { average: 4, count: 19 },
    tokenId: `#${digits.padStart(4, '0')}`,
    collectionName: 'Kurio Apes',
    attributes: ['Óculos', 'Esmeralda', ...(nft.badge === 'rare' ? ['Raro'] : [])],
    about: [
      `${nft.name} é uma obra digital 1/50 finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na Ethereum. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.`,
      'A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. Nova Sato recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.',
    ],
    technicalDetails: [
      { label: 'Rede', text: 'Cunhado na Ethereum com procedência imutável e metadados armazenados no IPFS.' },
      {
        label: 'Contrato',
        text: 'Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.',
      },
      { label: 'Direitos autorais', text: '0x7A42...19E8 · Contrato inteligente ERC-721 verificado.' },
    ],
  }
}

const REVIEWERS = ['Marina Costa', 'Rafael Dias', 'Júlia Prado', 'Tiago Nunes', 'Camila Rocha', 'Bruno Leal', 'Lara Mota']
const COMMENTS = [
  'Arte impecável e metadados verificados. A entrega do arquivo em alta resolução foi imediata.',
  'Ótima procedência e o criador é muito ativo na comunidade. Recomendo.',
  'Peça bonita, mas esperava mais utilidades no acesso exclusivo.',
  'Cores e detalhes ainda melhores ao vivo. Já está na minha coleção principal.',
  'Processo de compra simples e transparente, com o histórico de propriedade à vista.',
]

export function buildReviews(nft: Nft): NftReview[] {
  const seed = NFT_FIXTURES.findIndex((n) => n.id === nft.id)
  return Array.from({ length: 19 }, (_, i) => ({
    id: `${nft.id}-review-${i + 1}`,
    author: REVIEWERS[(i + seed) % REVIEWERS.length],
    rating: [5, 4, 4, 5, 3, 4, 5][(i + seed) % 7],
    createdAt: new Date(NEWEST - (i + 1) * 3 * DAY).toISOString(),
    comment: COMMENTS[(i * 2 + seed) % COMMENTS.length],
  }))
}
