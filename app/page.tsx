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
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl w-full space-y-16">
          
          {/* Purpose Statement */}
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 leading-tight">
              Learning that feels right.
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-normal max-w-xl">
              MonAlo is a space for thoughtful learning. No deadlines, no gamification, no artificial pressure. Just you, genuine courses, and the time you need to grow.
            </p>
          </div>

          {/* What You Can Do */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">What you can do</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Browse courses designed by people who know their craft. Learn from instructors who care about clarity over complexity. Enroll at your own pace, progress without judgment, and discover what genuinely interests you.
            </p>
          </div>

          {/* How It Feels */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">How it feels</h3>
            <p className="text-lg text-gray-700 italic">
              Calm, focused, and entirely yours.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Link href="/courses" className="flex-1">
              <Button 
                variant="primary" 
                size="lg"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                Explore courses
              </Button>
            </Link>
            <Link href="/home" className="flex-1">
              <Button 
                variant="ghost" 
                size="lg"
                className="w-full"
              >
                Learn more
              </Button>
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
