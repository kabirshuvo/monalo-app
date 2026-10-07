import Link from 'next/link'
import Button from '@/components/ui/Button'
import { SoftReveal } from '@/components/motion/SoftReveal'
import PlanetOrb from '@/components/cosmos/PlanetOrb'
import PageIllustration from '@/components/cosmos/PageIllustration'
import type { PlanetId } from '@/lib/cosmos/planets'

export type HomeSurfaceHeroProps = {
  eyebrow: string
  title: string
  description: string
  href: string
  cta: string
  /** The planet this part of the site lives on */
  planet: PlanetId
  /** @deprecated replaced by `planet` */
  emoji?: string
  /** @deprecated sections now sit on the shared sky */
  gradient?: string
  /** Optional secondary link */
  secondaryHref?: string
  secondaryCta?: string
  /** Soft reveal stagger */
  revealDelay?: number
  /** Put the illustration on the left (alternate sections for rhythm) */
  reverse?: boolean
}

export default function HomeSurfaceHero({
  eyebrow,
  title,
  description,
  href,
  cta,
  planet,
  secondaryHref,
  secondaryCta,
  revealDelay = 0,
  reverse = false,
}: HomeSurfaceHeroProps) {
  return (
    <SoftReveal
      as="section"
      delay={revealDelay}
      variant="up"
      className="border-t border-[var(--orbit-line)]"
    >
      <div data-tone={planet} className="tone-wash px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div
          className={`grid items-center gap-8 lg:gap-14 ${
            reverse ? 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]' : 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'
          }`}
        >
          <SoftReveal
            lines
            variant="fade"
            className={`space-y-5 text-center lg:text-left ${reverse ? 'lg:col-start-2 lg:row-start-1' : ''}`}
          >
            <p className="flex items-center justify-center gap-2 text-sm font-bold text-content-link lg:justify-start">
              <PlanetOrb planet={planet} size={12} />
              {eyebrow}
            </p>
            <h2 className="text-3xl font-normal leading-tight tracking-tight text-content sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-content-secondary lg:mx-0">
              {description}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2 lg:justify-start">
              <Link href={href}>
                <Button variant="primary" size="lg">
                  {cta}
                </Button>
              </Link>
              {secondaryHref && secondaryCta && (
                <Link href={secondaryHref}>
                  <Button variant="secondary" size="lg">
                    {secondaryCta}
                  </Button>
                </Link>
              )}
            </div>
          </SoftReveal>
          <SoftReveal
            delay={120}
            variant="scale"
            className={`order-first mx-auto w-full max-w-[18rem] sm:max-w-[22rem] lg:order-none lg:max-w-[26rem] ${
              reverse ? 'lg:col-start-1 lg:row-start-1' : ''
            }`}
          >
            <PageIllustration planet={planet} />
          </SoftReveal>
        </div>
      </div>
      </div>
    </SoftReveal>
  )
}
