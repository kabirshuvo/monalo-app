import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'
import EmptyState from '@/components/ui/EmptyState'

export const metadata = {
  title: 'Learner Dashboard - MonAlo',
  description: 'Track your courses and learning progress',
}

/**
 * Learner Dashboard Page
 * 
 * Protected page for learners to view courses, progress, and achievements.
 * Server-side auth check redirects unauthenticated users to /login
 * and unauthorized users back to /dashboard
 */
export default async function DashboardLearner() {
  const session = await auth()

  // Redirect unauthenticated users to login
  if (!session || !session.user) {
    redirect('/login')
  }

  // Only LEARNER and ADMIN roles can access
  const role = (session.user as any)?.role
  if (role !== 'LEARNER' && role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout
      userRole={(role as 'LEARNER' | 'ADMIN') || 'LEARNER'}
      userName={session.user.name || 'Learner'}
      currentPath="/dashboard/learner"
    >
      <div className="space-y-12">
        <div className="mb-10">
          <h1 className="text-4xl font-light text-gray-900">Your learning</h1>
          <p className="text-gray-600 mt-2 text-lg">Courses, progress, and achievements</p>
        </div>

        {/* Learning Progress */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">Progress overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Courses enrolled</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">In progress</p>
              <p className="text-3xl font-bold text-gray-900">0%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Certificates</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Your next steps</h2>
          <EmptyState
            variant="generic"
            title="Start your learning adventure"
            description="Explore courses when you're ready. There's no rush—pick what interests you most."
            actionLabel="Browse courses"
            onAction={() => {}}
          />
        </section>
      </div>
    </DashboardLayout>
  )
}
