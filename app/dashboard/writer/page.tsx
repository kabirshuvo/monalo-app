import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'

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
      <div className="space-y-8">
        {/* Quick Stats */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">My Content</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-gray-400 mt-1">Published items</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Drafts</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-gray-400 mt-1">Work in progress</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Total Views</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-gray-400 mt-1">All content</p>
            </div>
          </div>
        </section>

        {/* Content Management */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Content Management</h2>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <ul className="space-y-3 text-sm text-gray-600">
              <li>✏️ Create New Content (Coming soon)</li>
              <li>📝 My Posts (Coming soon)</li>
              <li>👁️ View Analytics (Coming soon)</li>
              <li>💬 Reader Comments (Coming soon)</li>
              <li>📊 Performance (Coming soon)</li>
            </ul>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
