import React, { Suspense } from 'react'
import PublicLayout from '@/components/layouts/PublicLayout'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import HomeSurfaceHero from '@/components/home/HomeSurfaceHero'
import HomePageSections from '@/components/home/HomePageSections'
import WelcomeDetectorClient from './WelcomeDetectorClient'
import { SoftReveal } from '@/components/motion/SoftReveal'
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
        <SoftReveal
          as="section"
          variant="scale"
          lines
          className="bg-amber-50/90 px-4 py-32 dark:bg-amber-950/20 sm:py-40 lg:py-48"
        >
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h1 className="text-5xl font-light leading-tight tracking-tight text-content sm:text-6xl lg:text-7xl">
              Monalo School
            </h1>
            <p className="text-lg font-normal leading-relaxed text-content-secondary sm:text-xl">
              An online school supported by craft, art, courses, and a freelancing team — every
              purchase and project helps students learn.
            </p>
          </div>
          <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-4 pt-8">
            <Link href="/learning">
              <Button variant="primary" size="lg" className="gallery-soft-cta px-8">
                Eco Penguin
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="secondary" size="lg" className="gallery-soft-cta">
                Explore courses
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="ghost" size="lg" className="gallery-soft-cta">
                Craft shop
              </Button>
            </Link>
          </div>
        </SoftReveal>

        <HomePageSections />

        {/* Surface heroes — blog, shop, gallery, team, learn */}
        {HOME_SURFACE_HEROES.map((hero, index) => (
          <HomeSurfaceHero key={hero.href} {...hero} revealDelay={index * 40} />
        ))}

        {/* Closing CTA */}
        <SoftReveal
          as="section"
          variant="up"
          className="bg-surface-muted px-4 py-24 sm:py-32 lg:py-40"
        >
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="font-serif text-3xl text-content sm:text-4xl">Ready to begin?</h2>
              <p className="text-lg text-content-secondary">
                Pick any path above — courses, craft, art, stories, or team services. There&apos;s
                no rush; we&apos;ll be here.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/learning">
                <Button variant="primary" size="lg" className="gallery-soft-cta">
                  Open Eco Penguin
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg" className="gallery-soft-cta">
                  Start today
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" size="lg" className="gallery-soft-cta">
                  About MonAlo
                </Button>
              </Link>
            </div>
          </div>
        </SoftReveal>
      </main>
    </PublicLayout>
  )
}
