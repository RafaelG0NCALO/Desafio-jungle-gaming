import { createFileRoute } from '@tanstack/react-router'
import { CatalogSection } from '@/features/catalog/CatalogSection'
import { Hero } from '@/features/home/Hero'
import { PromoCards } from '@/features/home/PromoCards'
import { JournalSection } from '@/features/journal/JournalSection'

export const Route = createFileRoute('/')({
  component: () => (
    <main>
      <Hero />
      <CatalogSection />
      <PromoCards />
      <JournalSection />
    </main>
  ),
})
