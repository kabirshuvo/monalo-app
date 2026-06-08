import Link from 'next/link'
import Button from '@/components/ui/Button'

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
}: HomeSurfaceHeroProps) {
  return (
    <section className={`px-4 py-20 sm:py-28 lg:py-32 bg-gradient-to-br ${gradient}`}>
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-[1fr,auto] lg:items-center">
          <div className="space-y-5 text-center lg:text-left">
            <p className="text-sm font-semibold text-content-link uppercase tracking-wide">
              {eyebrow}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-content leading-tight tracking-tight">
              {title}
            </h2>
            <p className="text-lg text-content-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
              {description}
            </p>
            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-3">
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
          </div>
          <div
            className="flex justify-center lg:justify-end"
            aria-hidden
          >
            <span className="text-7xl sm:text-8xl lg:text-9xl drop-shadow-sm select-none">
              {emoji}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
