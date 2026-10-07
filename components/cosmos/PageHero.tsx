import type { ReactNode } from 'react'
import PageIllustration, { hasIllustration } from '@/components/cosmos/PageIllustration'
import type { PlanetId } from '@/lib/cosmos/planets'

type PageHeroProps = {
  /** The page's planet: sets its colour tone and illustration */
  planet: PlanetId
  title: ReactNode
  description?: ReactNode
  /** Buttons or links under the description */
  children?: ReactNode
}

/**
 * Inner-page header. The page keeps its own subject (About is about, Courses is
 * courses); its planet supplies the colour tone and a scene drawn in that tone.
 */
export default function PageHero({ planet, title, description, children }: PageHeroProps) {
  const illustrated = hasIllustration(planet)

  return (
    <section data-tone={planet} className="relative overflow-hidden border-b border-[var(--orbit-line)]">
      <div
        className={`relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 ${
          illustrated ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12 lg:py-20' : 'lg:py-24'
        }`}
      >
        <div className="max-w-2xl">
          <h1 className="text-[clamp(2.4rem,5vw,3.75rem)] font-normal leading-[1.05] tracking-[-0.02em] text-content">
            {title}
          </h1>
          {description ? (
            <div className="mt-5 text-lg leading-relaxed text-content-secondary sm:text-xl">{description}</div>
          ) : null}
          {children ? <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div> : null}
        </div>

        {illustrated ? (
          <PageIllustration
            planet={planet}
            className="order-first mx-auto w-full max-w-[18rem] sm:max-w-[22rem] lg:order-none lg:max-w-[28rem]"
          />
        ) : null}
      </div>
    </section>
  )
}
