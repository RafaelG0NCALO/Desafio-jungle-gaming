import { useState } from 'react'
import { CONTACT, FEATURES, FOOTER_GROUPS } from './footerLinks'
import { FooterFeature } from './FooterFeature'
import { FooterLinkGroup } from './FooterLinkGroup'
import { FooterSocials } from './FooterSocials'
import { NewsletterForm } from './NewsletterForm'

export function SiteFooter() {
  const [notice, setNotice] = useState('')
  const unavailable = (what?: string) =>
    setNotice(what ? `“${what}” ainda não está disponível nesta demonstração.` : 'Este recurso ainda não está disponível nesta demonstração.')

  return (
    <footer className="mx-auto max-w-360 px-4 pb-8 md:px-8 lg:px-16">
      <div className="overflow-hidden rounded-xl bg-surface">
        <div className="grid gap-6 p-6 lg:grid-cols-4 lg:gap-0 lg:p-8">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="lg:border-r lg:border-nav-accent/40 lg:px-6 lg:first:pl-0">
              <FooterFeature {...feature} />
            </div>
          ))}
          <div className="lg:pl-6">
            <NewsletterForm onUnavailable={() => unavailable()} />
          </div>
        </div>

        <div className="grid gap-2 bg-[#3a2518] px-6 py-5 text-xs lg:grid-cols-4 lg:items-center lg:gap-0 lg:px-8">
          <p className="font-bold tracking-[0.1em]">KURIO</p>
          <p className="text-nav-tab">{CONTACT.tagline}</p>
          <a href={`mailto:${CONTACT.email}`} className="rounded-sm text-nav-text hover:text-nav-active focus-visible:outline-2 focus-visible:outline-nav-active">
            {CONTACT.email}
          </a>
          <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, '')}`} className="rounded-sm text-nav-text hover:text-nav-active focus-visible:outline-2 focus-visible:outline-nav-active">
            {CONTACT.phone}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-8 p-6 lg:grid-cols-4 lg:p-8">
          {FOOTER_GROUPS.map((group) => (
            <FooterLinkGroup key={group.title} group={group} onUnavailable={unavailable} />
          ))}
          <FooterSocials onUnavailable={unavailable} />
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-center text-xs text-nav-active">
        {notice}
      </p>
      <p className="mt-2 text-center text-[11px] text-nav-tab">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  )
}
