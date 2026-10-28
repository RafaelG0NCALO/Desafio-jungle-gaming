import type { ReactNode } from 'react'
import { FacebookGlyph, InstagramGlyph, LinkedinGlyph, XGlyph, YoutubeGlyph } from '@/components/icons/brand'
import { WALLETS } from './footerLinks'

const NETWORKS: { label: string; icon: ReactNode }[] = [
  { label: 'Facebook', icon: <FacebookGlyph /> },
  { label: 'Instagram', icon: <InstagramGlyph /> },
  { label: 'X', icon: <XGlyph /> },
  { label: 'LinkedIn', icon: <LinkedinGlyph /> },
  { label: 'YouTube', icon: <YoutubeGlyph /> },
]

export function FooterSocials({ onUnavailable }: { onUnavailable: (label: string) => void }) {
  return (
    <div>
      <h3 className="text-sm font-bold">Redes sociais</h3>
      <ul className="mt-4 flex gap-2">
        {NETWORKS.map(({ label, icon }) => (
          <li key={label}>
            <button
              type="button"
              aria-label={label}
              onClick={() => onUnavailable(label)}
              className="grid size-6 place-items-center rounded-sm border border-nav-accent text-nav-accent hover:bg-nav-accent hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
            >
              {icon}
            </button>
          </li>
        ))}
      </ul>

      <h3 className="mt-8 text-sm font-bold">Carteiras compatíveis</h3>
      <ul className="mt-3 inline-flex flex-wrap gap-x-3 gap-y-1 rounded-sm border border-nav-accent/40 px-3 py-2 text-[8px] tracking-widest text-nav-tab">
        {WALLETS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  )
}
