import { Suspense } from 'react'
import Link from 'next/link'
import LandingHeaderClient from './landing/LandingHeaderClient'
import LandingHeroClient from './landing/LandingHeroClient'
import LandingPageSections from '@/components/landing/LandingPageSections'
import SessionResetOnSignOut from '@/components/auth/SessionResetOnSignOut'
import { SoftReveal } from '@/components/motion/SoftReveal'
import { RouteLoader } from '@/components/ui/LoadingState'

// Force the root landing page to be statically rendered and public
export const dynamic = 'force-static'

export const metadata = {
  title: 'MonAlo - Learn at Your Own Pace',
  description: 'A thoughtful learning platform designed for genuine growth. No pressure, no distractions.',
}

export default function LaunchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 to-[#fafaf9] dark:from-zinc-950 dark:to-zinc-900">
      <Suspense fallback={<RouteLoader variant="page" className="min-h-[50vh]" />}>
        <SessionResetOnSignOut />
      </Suspense>
      <LandingHeaderClient />

      <main className="flex-1">
        <section className="relative w-full pb-8 sm:pb-12">
          <LandingHeroClient />
        </section>

        <LandingPageSections />
      </main>

      <footer className="border-t border-gray-100 px-4 py-8 sm:px-6 sm:py-12 dark:border-zinc-800 lg:px-8">
        <SoftReveal variant="fade" className="mx-auto max-w-6xl">
          <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
            A learning platform for everyone. No pressure. No rush.{' '}
            <Link href="/learning" className="font-semibold text-sky-700 hover:underline dark:text-sky-300">
              Eco Penguin
            </Link>
          </p>
        </SoftReveal>
      </footer>
    </div>
  )
}
