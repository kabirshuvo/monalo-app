import React, { Suspense } from 'react'
import PublicLayout from '@/components/layouts/PublicLayout'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import HomeSurfaceHero from '@/components/home/HomeSurfaceHero'
import WelcomeDetectorClient from './WelcomeDetectorClient'
import { RouteLoader } from '@/components/ui/LoadingState'
import { HOME_SURFACE_HEROES } from '@/lib/home/surface-heroes'

export default function HomePage() {
  return (
    <PublicLayout currentPath="/home">
      <main>
        <Suspense fallback={<RouteLoader variant="page" className="min-h-[20vh]" />}>
          <WelcomeDetectorClient />
        </Suspense>

        {/* School hero */}
        <section className="px-4 py-32 sm:py-40 lg:py-48 bg-amber-50/90 dark:bg-amber-950/20">
          <div className="mx-auto max-w-2xl text-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-content leading-tight tracking-tight">
                Monalo School
              </h1>
              <p className="text-lg sm:text-xl text-content-secondary leading-relaxed font-normal">
                An online school supported by craft, art, courses, and a freelancing team — every purchase and project helps students learn.
              </p>
            </div>
            <div className="pt-8 flex flex-wrap justify-center gap-4">
              <Link href="/courses">
                <Button variant="primary" size="lg" className="px-8">
                  Explore courses
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="secondary" size="lg">
                  Craft shop
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Surface heroes — blog, shop, gallery, team, learn */}
        {HOME_SURFACE_HEROES.map((hero) => (
          <HomeSurfaceHero key={hero.href} {...hero} />
        ))}

        {/* Closing CTA */}
        <section className="px-4 py-24 sm:py-32 lg:py-40 bg-surface-muted">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-content">
                Ready to begin?
              </h2>
              <p className="text-lg text-content-secondary">
                Pick any path above — courses, craft, art, stories, or team services. There&apos;s no rush; we&apos;ll be here.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="primary" size="lg">
                  Start today
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" size="lg">
                  About MonAlo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
