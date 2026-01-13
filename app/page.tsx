import Link from 'next/link'
import Button from '@/components/ui/Button'

export const metadata = {
  title: 'MonAlo - Learn at Your Own Pace',
  description: 'A thoughtful learning platform designed for genuine growth. No pressure, no distractions.',
}

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-light text-gray-900">MonAlo</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-3xl w-full space-y-12 lg:space-y-16">
          
          {/* Hero Headline & Subtext */}
          <div className="space-y-8">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 leading-tight tracking-tight">
              A calm place to learn, create, and grow.
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-normal max-w-2xl">
              MonAlo is a quiet digital space for learning, craft, and thoughtful work — built to feel human, not hurried.
            </p>
          </div>

          {/* Primary CTA + Secondary Link */}
          <div className="flex flex-col sm:flex-row items-start gap-6 pt-8">
            <Link href="/courses">
              <Button 
                variant="primary" 
                size="lg"
                className="bg-purple-500 hover:bg-purple-600 text-white px-8"
              >
                Explore MonAlo
              </Button>
            </Link>
            <Link href="/home" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <span className="text-base font-normal">Learn how it works</span>
              <span className="ml-2">→</span>
            </Link>
          </div>
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
