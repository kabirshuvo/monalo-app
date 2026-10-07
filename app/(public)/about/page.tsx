import PublicLayout from '@/components/layouts/PublicLayout'
import PageHero from '@/components/cosmos/PageHero'

export const metadata = {
  title: 'About',
  description: 'MonAlo means light of the mind. Why Monalo School learns at a calm, human pace.',
}

const VALUES = [
  {
    title: 'Clarity',
    body: 'Plain words over clever marketing. We say what we mean, to learners and to guardians.',
  },
  {
    title: 'Kindness',
    body: 'Learning is vulnerable. Questions and mistakes are welcome here, at any age.',
  },
  {
    title: 'Sustainability',
    body: 'Slow, steady progress beats burnout. You set the pace, and the school pays its own way.',
  },
]

export default function AboutPage() {
  return (
    <PublicLayout currentPath="/about">
      <PageHero
        planet="mercury"
        title="About MonAlo"
        description="Mon is the mind; alo is light. We build learning that is calm, focused and human, and fund it with craft, art and honest work."
      />

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <h2 className="text-3xl font-normal text-content sm:text-4xl">Our mission</h2>
          <p className="max-w-2xl text-lg leading-relaxed text-content-secondary">
            MonAlo exists to light the path to knowledge. No artificial urgency and no noise: just
            genuine growth, one lesson at a time. Every shop sale, gallery piece and client project
            sends something back to the school, so students keep learning.
          </p>
        </section>

        <section className="mt-20 grid gap-10 border-t border-[var(--orbit-line)] pt-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <h2 className="text-3xl font-normal text-content sm:text-4xl">What we hold to</h2>
          <dl className="grid gap-8">
            {VALUES.map((v) => (
              <div key={v.title} className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
                <dt className="font-serif text-2xl text-content">{v.title}</dt>
                <dd className="leading-relaxed text-content-secondary">{v.body}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </PublicLayout>
  )
}
