import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'
import EmptyState from '@/components/ui/EmptyState'

export const metadata = {
  title: 'Writer Dashboard - MonAlo',
  description: 'Manage your content and analytics',
}

/**
 * Writer Dashboard Page
 * 
 * Protected page for writers to manage courses, lessons, and content.
 * Server-side auth check redirects unauthenticated users to /login
 * and unauthorized users back to /dashboard
 */
export default async function DashboardWriter() {
  const session = await auth()

  // Redirect unauthenticated users to login
  if (!session || !session.user) {
    redirect('/login')
  }

  // Only WRITER and ADMIN roles can access
  const role = (session.user as any)?.role
  if (role !== 'WRITER' && role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout
      userRole={(role as 'WRITER' | 'ADMIN') || 'WRITER'}
      userName={session.user.name || 'Writer'}
      currentPath="/dashboard/writer"
    >
      <div className="space-y-12">
        <div className="mb-10">
          <h1 className="text-4xl font-light text-gray-900">Your content</h1>
          <p className="text-gray-600 mt-2 text-lg">Create and manage your courses</p>
        </div>

        {/* Content Stats */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">Content overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Work in progress</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Views</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </section>

        {/* What You Can Do */}
        <section>Share your knowledge</h2>
          <EmptyState
            variant="courses-instructor"
            title="Ready to create?"
            description="Your first course is an opportunity to share what you know. Take your time building something meaningful."
            actionLabel="Create your first course"
            onAction={() => {}}
          /l>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
