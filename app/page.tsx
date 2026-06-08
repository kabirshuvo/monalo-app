import { Suspense } from 'react'
import LandingHeaderClient from './landing/LandingHeaderClient'
import LandingHeroClient from './landing/LandingHeroClient'
import SessionResetOnSignOut from '@/components/auth/SessionResetOnSignOut'
import { RouteLoader } from '@/components/ui/LoadingState'

// Force the root landing page to be statically rendered and public
export const dynamic = 'force-static'

export const metadata = {
  title: 'MonAlo - Learn at Your Own Pace',
  description: 'A thoughtful learning platform designed for genuine growth. No pressure, no distractions.',
}

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-zinc-950 dark:to-zinc-900 flex flex-col">
      <Suspense fallback={<RouteLoader variant="page" className="min-h-[50vh]" />}>
        <SessionResetOnSignOut />
      </Suspense>
      <LandingHeaderClient />

      {/* Main Content */}
      <main className="flex-1 flex items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-6xl w-full mx-auto">
          <LandingHeroClient />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-gray-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-gray-600 dark:text-zinc-400 text-center">
            A learning platform for everyone. No pressure. No rush.
          </p>
        </div>
      </footer>
    </div>
  )
}
