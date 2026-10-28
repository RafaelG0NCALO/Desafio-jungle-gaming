import { createFileRoute } from '@tanstack/react-router'
import { CatalogSection } from '@/features/catalog/CatalogSection'

export const Route = createFileRoute('/mercado')({
  component: () => (
    <main>
      <h1 className="sr-only">Mercado de NFTs</h1>
      <CatalogSection />
    </main>
  ),
})
