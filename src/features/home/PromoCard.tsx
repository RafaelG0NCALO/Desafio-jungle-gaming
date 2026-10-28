import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

interface PromoCardProps {
  imageSrc: string
  imageAlt: string
  title: string
  description: string
  link: Pick<LinkProps, 'to' | 'search'>
}

export function PromoCard({ imageSrc, imageAlt, title, description, link }: PromoCardProps) {
  return (
    <article className="grid grid-cols-[42%_1fr] overflow-hidden rounded-xl bg-surface">
      <img
        src={imageSrc}
        alt={imageAlt}
        width={320}
        height={320}
        loading="lazy"
        className="size-full rounded-xl object-cover"
      />

      <div className="flex flex-col items-end justify-between gap-4 p-4 text-right lg:p-6">
        <div>
          <h3 className="text-sm leading-snug font-bold sm:text-base lg:text-xl">{title}</h3>
          <p className="mt-3 text-xs leading-relaxed text-nav-tab lg:text-sm">{description}</p>
        </div>

        <Link
          {...link}
          className="inline-flex h-8 items-center gap-2 rounded-md bg-nav-accent px-4 text-xs leading-none font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active lg:h-9 lg:text-sm"
        >
          Explorar
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
