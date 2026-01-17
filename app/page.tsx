import Link from 'next/link'
import Button from '@/components/ui/Button'
import LandingHeaderClient from './landing/LandingHeaderClient'
import LandingHeroClient from './landing/LandingHeroClient'

export const metadata = {
  title: 'MonAlo - Learn at Your Own Pace',
  description: 'A thoughtful learning platform designed for genuine growth. No pressure, no distractions.',
}

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      <LandingHeaderClient />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-3xl w-full">
          <LandingHeroClient />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-gray-600 text-center">
            A learning platform for everyone. No pressure. No rush.
          </p>
        </div>
      </footer>
    </div>
  )
}
