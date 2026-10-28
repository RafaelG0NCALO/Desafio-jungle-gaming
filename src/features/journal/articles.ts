import magnata from '@/assets/images/nft-magnata.webp'
import greenJacket from '@/assets/images/nft-green-jacket.webp'
import hat from '@/assets/images/nft-hat.webp'
import headset from '@/assets/images/nft-headset.webp'

export interface Article {
  id: string
  imageSrc: string
  imageAlt: string
  publishedAt: string
  readingMinutes: number
  title: string
  summary: string
}

export const ARTICLES: Article[] = [
  {
    id: 'propriedade-de-nfts',
    imageSrc: magnata,
    imageAlt: 'Macaco de brinco dourado, gola alta verde e blazer bege',
    publishedAt: '2026-09-12',
    readingMinutes: 6,
    title: 'Como funciona a propriedade de NFTs',
    summary: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
  },
  {
    id: 'artistas-digitais',
    imageSrc: greenJacket,
    imageAlt: 'Macaco de óculos escuros e jaqueta verde',
    publishedAt: '2026-09-13',
    readingMinutes: 2,
    title: '10 artistas digitais para acompanhar',
    summary: 'Conheça criadores que moldam a cultura digital.',
  },
  {
    id: 'raridade-e-procedencia',
    imageSrc: hat,
    imageAlt: 'Macaco cinza de chapéu verde e moletom roxo',
    publishedAt: '2026-09-15',
    readingMinutes: 3,
    title: 'Raridade, atributos e procedência',
    summary: 'Entenda raridade, procedência, direitos autorais e utilidade.',
  },
  {
    id: 'proteger-carteira',
    imageSrc: headset,
    imageAlt: 'Macaco laranja de fones verdes e jaqueta bege',
    publishedAt: '2026-09-15',
    readingMinutes: 2,
    title: 'Como proteger sua carteira',
    summary: 'Proteja sua carteira, seus ativos e sua identidade.',
  },
]
