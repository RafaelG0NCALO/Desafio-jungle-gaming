import { z } from 'zod'

export const COLLECTIONS = [
  { value: 'arte-digital', label: 'Arte digital' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'musica', label: 'Música' },
  { value: 'arte-3d', label: 'Arte 3D' },
  { value: 'colecionaveis', label: 'Colecionáveis' },
  { value: 'generativa', label: 'Generativa' },
  { value: 'jogos', label: 'Jogos' },
  { value: 'assinaturas', label: 'Assinaturas' },
  { value: 'utilidade', label: 'Utilidade' },
] as const

export const NETWORKS = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'solana', label: 'Solana' },
] as const

export const SORTS = [
  { value: 'recent', label: 'Listados recentemente' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'likes', label: 'Mais curtidos' },
] as const

export type SortValue = (typeof SORTS)[number]['value']

export const PRICE_BOUNDS = { min: '0.02', max: '12.30' } as const

export const ETH_DECIMAL = /^\d+(\.\d{1,18})?$/

const decimal = z.string().regex(ETH_DECIMAL)

export const catalogSearchSchema = z.object({
  collections: z
    .array(z.enum(COLLECTIONS.map((c) => c.value) as [string, ...string[]]))
    .optional()
    .catch(undefined),
  networks: z
    .array(z.enum(NETWORKS.map((n) => n.value) as [string, ...string[]]))
    .optional()
    .catch(undefined),
  min: decimal.optional().catch(undefined),
  max: decimal.optional().catch(undefined),
  sort: z
    .enum(SORTS.map((s) => s.value) as [SortValue, ...SortValue[]])
    .optional()
    .catch(undefined),
  q: z.string().trim().min(1).optional().catch(undefined),
  tab: z.enum(['new', 'trending']).optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
})

export type CatalogSearch = z.infer<typeof catalogSearchSchema>

export const CATALOG_TABS = [
  { value: undefined, label: 'Todos os NFTs' },
  { value: 'new', label: 'Novos lançamentos' },
  { value: 'trending', label: 'Em alta' },
] as const

export function countActiveFilters(s: CatalogSearch): number {
  return (
    (s.collections?.length ?? 0) +
    (s.networks?.length ?? 0) +
    (s.min ? 1 : 0) +
    (s.max ? 1 : 0) +
    (s.sort && s.sort !== 'recent' ? 1 : 0)
  )
}
