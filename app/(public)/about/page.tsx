import PublicLayout from '@/components/layouts/PublicLayout'

export default function AboutPage() {
  return (
    <PublicLayout currentPath="/about">
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 space-y-3">
          <p className="text-sm font-semibold text-blue-600">About</p>
          <h1 className="text-3xl font-bold text-gray-900">About MonAlo</h1>
          <p className="text-gray-600 max-w-3xl">
            Light of the mind. We believe in thoughtful, sustainable learning that respects your time and builds real understanding.
          </p>
        </div>

        <div className="space-y-12">
          {/* Mission */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed max-w-3xl">
              MonAlo exists to illuminate the path to knowledge. We create learning experiences that are calm, focused, and human-centered. No gamification, no artificial urgency—just genuine growth, one lesson at a time.
            </p>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
            <ul className="space-y-4 max-w-3xl">
              <li className="flex gap-4">
                <span className="text-blue-600 font-semibold mt-1">•</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Clarity</h3>
                  <p className="text-gray-600 text-sm">Clear communication over clever marketing. We say what we mean.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-blue-600 font-semibold mt-1">•</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Kindness</h3>
                  <p className="text-gray-600 text-sm">Learning is vulnerable. We create a safe space for questions and mistakes.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-blue-600 font-semibold mt-1">•</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Sustainability</h3>
                  <p className="text-gray-600 text-sm">Slow, steady progress beats burnout. You set the pace.</p>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </PublicLayout>
  )
}
