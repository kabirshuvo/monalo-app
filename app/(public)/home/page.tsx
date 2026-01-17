import PublicLayout from '@/components/layouts/PublicLayout'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import WelcomeDetectorClient from './WelcomeDetectorClient'

export default function HomePage() {
  return (
    <PublicLayout currentPath="/home">
      <main className="bg-amber-50">
        <WelcomeDetectorClient />
        {/* Hero Section */}
        <section className="px-4 py-32 sm:py-40 lg:py-48">
          <div className="mx-auto max-w-2xl text-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 leading-tight tracking-tight">
                Learn at your own pace
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-normal">
                Thoughtful courses and resources designed for focused learning. No pressure, no distractions—just genuine growth.
              </p>
            </div>
            <div className="pt-8">
              <Link href="/courses">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8"
                >
                  Explore courses
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-24 sm:py-32 lg:py-40 bg-white">
          <div className="mx-auto max-w-4xl space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Why choose MonAlo
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto text-lg">
                We've designed every detail to support your learning journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Your pace</h3>
                <p className="text-gray-700 leading-relaxed">
                  No deadlines, no rushing. You decide when and how fast to learn.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Clear focus</h3>
                <p className="text-gray-700 leading-relaxed">
                  No gamification, badges, or artificial urgency. Just thoughtful content.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Real growth</h3>
                <p className="text-gray-700 leading-relaxed">
                  Curated courses from people who know their craft. Learn from the best.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-24 sm:py-32 lg:py-40 bg-amber-50">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Ready to begin?
              </h2>
              <p className="text-lg text-gray-700">
                Start exploring courses, or browse our shop for learning resources. There's no rush—we'll be here.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/courses">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Browse courses
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost" size="lg">
                  Read the blog
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
