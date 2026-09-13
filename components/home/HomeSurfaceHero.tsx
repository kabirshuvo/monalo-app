import Link from 'next/link'
import Button from '@/components/ui/Button'
import { SoftReveal } from '@/components/motion/SoftReveal'

export type HomeSurfaceHeroProps = {
  eyebrow: string
  title: string
  description: string
  href: string
  cta: string
  emoji: string
  /** Tailwind gradient classes for section background */
  gradient: string
  /** Optional secondary link */
  secondaryHref?: string
  secondaryCta?: string
  /** Soft reveal stagger */
  revealDelay?: number
}

export default function HomeSurfaceHero({
  eyebrow,
  title,
  description,
  href,
  cta,
  emoji,
  gradient,
  secondaryHref,
  secondaryCta,
  revealDelay = 0,
}: HomeSurfaceHeroProps) {
  return (
    <SoftReveal
      as="section"
      delay={revealDelay}
      variant="up"
      className={`bg-gradient-to-br px-4 py-20 sm:py-28 lg:py-32 ${gradient}`}
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-[1fr,auto] lg:items-center">
          <SoftReveal lines variant="fade" className="space-y-5 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-content-link">
              {eyebrow}
            </p>
            <h2 className="text-3xl font-light leading-tight tracking-tight text-content sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-content-secondary lg:mx-0">
              {description}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2 lg:justify-start">
              <Link href={href}>
                <Button variant="primary" size="lg" className="gallery-soft-cta">
                  {cta}
                </Button>
              </Link>
              {secondaryHref && secondaryCta && (
                <Link href={secondaryHref}>
                  <Button variant="secondary" size="lg" className="gallery-soft-cta">
                    {secondaryCta}
                  </Button>
                </Link>
              )}
            </div>
          </SoftReveal>
          <SoftReveal
            delay={120}
            variant="scale"
            className="flex justify-center lg:justify-end"
            aria-hidden
          >
            <span className="select-none text-7xl drop-shadow-sm sm:text-8xl lg:text-9xl">
              {emoji}
            </span>
          </SoftReveal>
        </div>
      </div>
    </SoftReveal>
  )
}
