import type { LinkProps } from '@tanstack/react-router'
import { COLLECTIONS } from '@/features/catalog/search'

export interface FooterLink {
  label: string
  link?: Pick<LinkProps, 'to' | 'search'>
}

export interface FooterLinkGroupData {
  title: string
  links: FooterLink[]
}

const collectionLink = (value: (typeof COLLECTIONS)[number]['value']): FooterLink => ({
  label: COLLECTIONS.find((c) => c.value === value)!.label,
  link: { to: '/mercado', search: { collections: [value] } },
})

export const FOOTER_GROUPS: FooterLinkGroupData[] = [
  {
    title: 'Meu perfil',
    links: [
      { label: 'Meu perfil', link: { to: '/perfil' } },
      { label: 'Minha coleção' },
      { label: 'Atividade' },
      { label: 'Estúdio do criador' },
      { label: 'Lista de interesse' },
    ],
  },
  {
    title: 'Central de ajuda',
    links: [
      { label: 'Central de ajuda' },
      { label: 'Como comprar NFTs' },
      { label: 'Carteira e segurança' },
      { label: 'Política do mercado' },
      { label: 'Denunciar item' },
    ],
  },
  {
    title: 'Coleções',
    links: [
      collectionLink('arte-digital'),
      collectionLink('fotografia'),
      collectionLink('musica'),
      collectionLink('arte-3d'),
      collectionLink('utilidade'),
    ],
  },
]

export const FEATURES = [
  {
    mark: 'W',
    title: 'Segurança da carteira',
    text: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    mark: 'C',
    title: 'Criadores em destaque',
    text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    mark: 'D',
    title: 'Alertas de lançamentos',
    text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
] as const

export const WALLETS = ['METAMASK', 'WALLETCONNECT', 'EXODUS'] as const

export const CONTACT = {
  tagline: 'Feito para colecionadores, criadores e cultura',
  email: 'contato@email.com',
  phone: '+55 11 4002 8922',
} as const
