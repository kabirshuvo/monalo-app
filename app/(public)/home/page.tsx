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
import PageHero from '@/components/cosmos/PageHero'

export default function HomePage() {
  return (
    <PublicLayout currentPath="/home">
      <main>
        <Suspense fallback={<RouteLoader variant="page" className="min-h-[20vh]" />}>
          <WelcomeDetectorClient />
        </Suspense>

        {/* The sun of the system */}
        <PageHero
          planet="sun"
          title="Monalo School"
          description="An online school kept alight by craft, art, courses and a freelance team. Every purchase and project helps students learn."
        >
          <Link href="/learning">
            <Button variant="primary" size="lg">
              Open Eco Penguin
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="secondary" size="lg">
              Explore courses
            </Button>
          </Link>
        </PageHero>

        <HomePageSections />

        {/* Surface heroes — blog, shop, gallery, team, learn */}
        {HOME_SURFACE_HEROES.map((hero, index) => (
          <HomeSurfaceHero key={hero.href} {...hero} revealDelay={index * 40} reverse={index % 2 === 1} />
        ))}

        {/* Closing CTA */}
        <SoftReveal
          as="section"
          variant="up"
          className="border-t border-[var(--orbit-line)] px-4 py-24 sm:py-32"
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
                <Button variant="primary" size="lg">
                  Open Eco Penguin
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg">
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
        </SoftReveal>
      </main>
    </PublicLayout>
  )
}
