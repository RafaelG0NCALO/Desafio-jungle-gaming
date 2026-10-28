import { useState } from 'react'
import { ArticleCard } from './ArticleCard'
import { ARTICLES } from './articles'

export function JournalSection() {
  const [notice, setNotice] = useState('')

  return (
    <section aria-labelledby="journal-title" className="mx-auto max-w-360 px-4 pb-12 md:px-8 lg:px-16 lg:pb-20">
      <header className="text-center">
        <h2 id="journal-title" className="text-xl font-bold lg:text-2xl">
          Diário da Cunhagem
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-xs text-nav-tab lg:text-sm">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {ARTICLES.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onRead={() => setNotice('Os artigos do Diário ainda não estão disponíveis nesta demonstração.')}
          />
        ))}
      </div>

      <p role="status" aria-live="polite" className="mt-4 min-h-6 text-center text-sm text-nav-active">
        {notice}
      </p>
    </section>
  )
}
