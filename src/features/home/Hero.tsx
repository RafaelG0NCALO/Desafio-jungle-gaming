import { useEffect, useState } from 'react'
import type { FocusEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import greenJacket from '@/assets/images/nft-green-jacket.webp'
import hat from '@/assets/images/nft-hat.webp'
import magnata from '@/assets/images/nft-magnata.webp'

const AUTOPLAY_MS = 4000

interface Slide {
  src: string
  alt: string
  eyebrow: string
  title: { desktop: string; mobile: string }
  text: { desktop: string; mobile: string }
}

const SLIDES: Slide[] = [
  {
    src: greenJacket,
    alt: 'NFT em destaque: macaco de óculos escuros e jaqueta verde',
    eyebrow: 'Bem-vindo à Kurio',
    title: { desktop: 'SEJA DONO DO FUTURO DA ARTE DIGITAL', mobile: 'SEJA DONO DA CULTURA DIGITAL' },
    text: {
      desktop:
        'Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.',
      mobile: 'Descubra NFTs selecionados de criadores do mundo todo.',
    },
  },
  {
    src: hat,
    alt: 'NFT em destaque: macaco cinza de chapéu verde e moletom roxo',
    eyebrow: 'Novos lançamentos',
    title: { desktop: 'COLEÇÕES QUE ESTÃO DEFININDO O AMANHÃ', mobile: 'O QUE HÁ DE NOVO NA KURIO' },
    text: {
      desktop:
        'Explore os lançamentos mais recentes, acompanhe as coleções em alta e encontre a próxima peça para a sua galeria digital.',
      mobile: 'Explore os lançamentos e as coleções em alta.',
    },
  },
  {
    src: magnata,
    alt: 'NFT em destaque: macaco de brinco dourado, gola alta verde e blazer bege',
    eyebrow: 'Artistas no radar',
    title: { desktop: 'APOIE ARTISTAS E COLECIONE COM CONFIANÇA', mobile: 'APOIE OS CRIADORES' },
    text: {
      desktop:
        'Cada peça tem origem verificada e histórico transparente. Conheça quem cria e acompanhe a trajetória de cada artista.',
      mobile: 'Origem verificada e histórico transparente.',
    },
  },
]

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function Hero() {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  const playing = !hovered && !focused && !reducedMotion

  useEffect(() => {
    if (!playing) return
    let id: number | undefined
    const start = () => {
      id = window.setTimeout(() => setActive((a) => (a + 1) % SLIDES.length), AUTOPLAY_MS)
    }
    const onVisibility = () => {
      window.clearTimeout(id)
      if (!document.hidden) start()
    }
    if (!document.hidden) start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [playing, active])

  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false)
  }

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="NFTs em destaque"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
      className="mx-auto max-w-360 px-4 md:px-8 lg:py-12 lg:px-16"
    >
      <div className="relative overflow-hidden rounded-3xl bg-[#2e1d13] p-4 pb-10 lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0 lg:pb-14">
        <span aria-hidden className="pointer-events-none absolute top-0 -left-[6%] aspect-square h-full rounded-full bg-[#b87c4a]/45 lg:hidden" />
        <span aria-hidden className="pointer-events-none absolute top-0 left-[20%] aspect-square h-full rounded-full bg-[#b87c4a]/45 lg:hidden" />
        <div className="relative grid grid-cols-[1fr_auto] items-center gap-1 md:gap-12 lg:grid-cols-2 lg:gap-12">
          <div className="grid" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
            {SLIDES.map((slide, i) => {
              const isActive = i === active
              const Heading = isActive ? 'h1' : 'p'
              return (
                <div
                  key={slide.src}
                  aria-hidden={!isActive}
                  className={`col-start-1 row-start-1 transition-opacity duration-500 motion-reduce:transition-none ${
                    isActive ? 'opacity-100' : 'pointer-events-none invisible opacity-0'
                  }`}
                >
                  <p className="text-[13px] leading-none md:text-sm">{slide.eyebrow}</p>
                  <Heading className="mt-3 text-lg leading-snug font-bold md:mt-4 md:text-3xl lg:mt-5 lg:text-4xl lg:leading-[1.6] xl:text-[44px]">
                    <span className="lg:hidden">{slide.title.mobile}</span>
                    <span className="hidden lg:inline">{slide.title.desktop}</span>
                  </Heading>
                  <p className="mt-3 max-w-md text-[12px] leading-snug text-nav-tab md:text-base lg:mt-5">
                    <span className="lg:hidden">{slide.text.mobile}</span>
                    <span className="hidden lg:inline">{slide.text.desktop}</span>
                  </p>
                  <Link
                    to="/mercado"
                    tabIndex={isActive ? undefined : -1}
                    className="mt-4 inline-flex items-center gap-2 rounded-md text-[13px] leading-none font-medium md:mt-6 md:text-base text-nav-active focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nav-active lg:mt-8 lg:h-10 lg:bg-nav-accent lg:px-6 lg:text-background lg:hover:opacity-90"
                  >
                    EXPLORAR
                    <ArrowRight className="size-4 lg:hidden" aria-hidden />
                  </Link>
                </div>
              )
            })}
          </div>

          <div className="relative w-36 sm:w-48 md:w-64 lg:w-full lg:max-w-125 lg:justify-self-end">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface lg:rounded-3xl">
              {SLIDES.map((slide, i) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={i === active ? slide.alt : ''}
                  aria-hidden={i !== active}
                  width={500}
                  height={500}
                  fetchPriority={i === 0 ? 'high' : undefined}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className={`absolute inset-0 size-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${
                    i === active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center lg:bottom-4">
          <div role="group" aria-label="Destaques" className="flex">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Ir para o destaque ${i + 1} de ${SLIDES.length}`}
                aria-current={i === active ? 'true' : undefined}
                onClick={() => setActive(i)}
                className="grid size-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-nav-active"
              >
                <span
                  className={`size-2 rounded-full transition-colors ${i === active ? 'bg-nav-active' : 'bg-nav-accent/50'}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
