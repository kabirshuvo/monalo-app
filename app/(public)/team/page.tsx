import PublicLayout from '@/components/layouts/PublicLayout'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'
import Button from '@/components/ui/Button'

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
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold text-blue-600">Team</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Skills for hire — revenue for the school</h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Monalo freelancers deliver client work; income helps fund programs and students.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mb-12">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">{s.title}</h2>
              <p className="text-sm text-gray-600 mt-2">{s.description}</p>
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
