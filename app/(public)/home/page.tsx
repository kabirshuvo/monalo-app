import PublicLayout from '@/components/layouts/PublicLayout'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HomePage() {
  return (
    <PublicLayout currentPath="/home">
      <main className="bg-amber-50">
        {/* Hero Section */}
        <section className="px-4 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Light of the mind
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                Learning that respects your pace. Courses and resources designed for focused growth, without pressure or distraction.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/courses">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Explore courses
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="secondary" size="lg">
                  Browse resources
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section - Light Lavender */}
        <section className="px-4 py-24 sm:py-32 lg:py-40 bg-purple-50">
          <div className="mx-auto max-w-4xl space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Why choose MonAlo
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto text-lg">
                We've designed every detail to support your learning journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Your pace</h3>
                <p className="text-gray-700 leading-relaxed">
                  No deadlines, no rushing. You decide when and how fast to learn. Progress is progress, no matter the speed.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Clear focus</h3>
                <p className="text-gray-700 leading-relaxed">
                  No gamification, badges, or artificial urgency. Just clear lessons and thoughtful content.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Curated paths</h3>
                <p className="text-gray-700 leading-relaxed">
                  Thoughtfully designed courses from people who know their craft. Learn from the best.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m0 0l-2-1m2 1v2.5M14 4l-2 1m0 0L10 4m2 1v2.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Track progress</h3>
                <p className="text-gray-700 leading-relaxed">
                  See how far you've come. Gentle progress indicators show your journey, not your score.
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
