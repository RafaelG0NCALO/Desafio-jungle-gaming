import { ArrowRight } from 'lucide-react'
import type { Article } from './articles'

const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' })

interface ArticleCardProps {
  article: Article
  onRead: () => void
}

export function ArticleCard({ article, onRead }: ArticleCardProps) {
  const { imageSrc, imageAlt, publishedAt, readingMinutes, title, summary } = article

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-surface">
      <img src={imageSrc} alt={imageAlt} width={320} height={266} loading="lazy" className="aspect-6/5 w-full rounded-xl object-cover" />

      <div className="flex flex-1 flex-col p-3 lg:p-4">
        <p className="flex flex-col text-[10px] leading-snug text-nav-tab/80 lg:flex-row lg:gap-2 lg:text-xs">
          <time dateTime={publishedAt} className="whitespace-nowrap">
            {dateFormat.format(new Date(publishedAt))}
          </time>
          <span aria-hidden className="hidden lg:inline">
            |
          </span>
          <span className="sr-only">, </span>
          <span className="whitespace-nowrap">Leitura de {readingMinutes} min</span>
        </p>
        <h3 className="mt-2 text-sm leading-snug font-bold lg:text-base">{title}</h3>
        <p className="mt-2 text-xs leading-snug text-nav-tab">{summary}</p>

        <button
          type="button"
          onClick={onRead}
          className="mt-auto inline-flex items-center gap-1 self-start rounded-sm pt-4 text-xs text-nav-active hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
        >
          Ler mais
          <ArrowRight className="size-3" aria-hidden />
          <span className="sr-only">: {title}</span>
        </button>
      </div>
    </article>
  )
}
