import { useState } from 'react'
import { Search } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

interface NftGalleryProps {
  images: { url: string; alt: string }[]
}

export function NftGallery({ images }: NftGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const current = images[selected] ?? images[0]

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
      <ul aria-label="Imagens do NFT" className="order-2 flex gap-3 lg:order-1 lg:flex-col">
        {images.map((image, i) => (
          <li key={i} className="w-1/4 lg:w-20">
            <button
              type="button"
              aria-label={`Ver imagem ${i + 1} de ${images.length}`}
              aria-pressed={i === selected}
              onClick={() => setSelected(i)}
              className={`block w-full rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active ${
                i === selected ? 'border-nav-active' : 'border-transparent'
              }`}
            >
              <img src={image.url} alt="" width={80} height={80} loading="lazy" className="aspect-square w-full rounded-md object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative order-1 min-w-0 flex-1 rounded-xl bg-surface p-3 lg:order-2">
        <img
          src={current.url}
          alt={current.alt}
          width={560}
          height={560}
          fetchPriority="high"
          className="aspect-square w-full rounded-lg object-cover"
        />
        <button
          type="button"
          aria-label="Ampliar imagem"
          aria-haspopup="dialog"
          onClick={() => setZoomOpen(true)}
          className="absolute top-6 right-6 grid size-8 place-items-center rounded-full bg-background/70 text-nav-text hover:text-nav-active focus-visible:outline-2 focus-visible:outline-nav-active"
        >
          <Search className="size-4" aria-hidden />
        </button>
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-3xl p-3">
          <DialogTitle className="sr-only">Imagem ampliada</DialogTitle>
          <DialogDescription className="sr-only">{current.alt}</DialogDescription>
          <img src={current.url} alt={current.alt} className="max-h-[80dvh] w-full rounded-lg object-contain" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
