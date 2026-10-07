import PublicLayout from '@/components/layouts/PublicLayout'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import PageHero from '@/components/cosmos/PageHero'

export const metadata = {
  title: 'Team Services - Monalo School',
  description: 'Freelancing team: software, design, video, and more — earnings support the school',
}

const services = [
  { title: 'Software & automation', description: 'Web apps, workflows, and integrations for clients.' },
  { title: 'Graphic design', description: 'Brand, print, and digital assets.' },
  { title: 'Video editing', description: 'Courses, promos, and storytelling.' },
  { title: 'Personal assistant', description: 'Organized support for busy teams.' },
]

export default function TeamPage() {
  return (
    <PublicLayout currentPath="/team">
      <PageHero
        planet="jupiter"
        title="Skills for hire, revenue for the school"
        description="Monalo freelancers take on real client work. What you pay helps fund programmes and students."
      >
        <Link href="/contact">
          <Button size="lg">Ask for a quote</Button>
        </Link>
      </PageHero>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="grid gap-6 sm:grid-cols-2 mb-12">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-3xl border border-[var(--orbit-line)] bg-surface p-7 text-left"
            >
              <h2 className="font-serif text-2xl text-content">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-content-secondary">{s.description}</p>
            </div>
          ))}
        </div>

        <EmptyState
          variant="blog"
          title="Quote requests coming soon"
          description="A client intake form will be added in the next phase. Contact us if you need help now."
        />

        <div className="mt-8 flex justify-center">
          <Link href="/contact">
            <Button>Contact Monalo</Button>
          </Link>
        </div>
      </main>
    </PublicLayout>
  )
}
