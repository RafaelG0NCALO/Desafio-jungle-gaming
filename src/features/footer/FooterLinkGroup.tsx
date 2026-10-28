import { Link } from '@tanstack/react-router'
import type { FooterLinkGroupData } from './footerLinks'

const linkClass =
  'rounded-sm text-left text-xs text-nav-tab hover:text-nav-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active'

interface FooterLinkGroupProps {
  group: FooterLinkGroupData
  onUnavailable: (label: string) => void
}

export function FooterLinkGroup({ group, onUnavailable }: FooterLinkGroupProps) {
  return (
    <nav aria-label={group.title}>
      <h3 className="text-sm font-bold">{group.title}</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {group.links.map(({ label, link }) => (
          <li key={label}>
            {link ? (
              <Link {...link} className={linkClass}>
                {label}
              </Link>
            ) : (
              <button type="button" onClick={() => onUnavailable(label)} className={linkClass}>
                {label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
