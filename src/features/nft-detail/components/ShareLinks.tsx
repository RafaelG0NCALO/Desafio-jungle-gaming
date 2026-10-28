import { Mail } from 'lucide-react'
import { LinkedinGlyph, XGlyph } from '@/components/icons/brand'

const linkClass =
  'grid size-6 place-items-center rounded-sm text-nav-text hover:text-nav-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active'

export function ShareLinks({ name }: { name: string }) {
  const url = typeof window === 'undefined' ? '' : window.location.href
  const text = `Veja ${name} na Kurio`
  const encoded = { url: encodeURIComponent(url), text: encodeURIComponent(text) }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="font-bold">Compartilhe este NFT:</span>
      <ul className="flex items-center gap-1">
        <li>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded.url}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartilhar no LinkedIn (abre em nova aba)"
            className={linkClass}
          >
            <LinkedinGlyph />
          </a>
        </li>
        <li>
          <a href={`mailto:?subject=${encoded.text}&body=${encoded.url}`} aria-label="Compartilhar por e-mail" className={linkClass}>
            <Mail className="size-4" aria-hidden />
          </a>
        </li>
        <li>
          <a
            href={`https://twitter.com/intent/tweet?text=${encoded.text}&url=${encoded.url}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartilhar no X (abre em nova aba)"
            className={linkClass}
          >
            <XGlyph />
          </a>
        </li>
      </ul>
    </div>
  )
}
