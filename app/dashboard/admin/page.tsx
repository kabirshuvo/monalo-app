import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'

export const metadata = {
  title: 'Admin Dashboard - MonAlo',
  description: 'Platform administration and analytics',
}

/**
 * Admin Dashboard Page
 * 
 * Protected page for admins to manage users, courses, orders, and platform analytics.
 * Server-side auth check redirects unauthenticated users to /login
 * and unauthorized users back to /dashboard
 */
export default async function DashboardAdmin() {
  const session = await auth()

  // Redirect unauthenticated users to login
  if (!session || !session.user) {
    redirect('/login')
  }

  // Only ADMIN role can access
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout
      userRole="ADMIN"
      userName={session.user.name || 'Admin'}
      currentPath="/dashboard/admin"
    >
      <div className="space-y-8">
        {/* Quick Stats */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Total Users</p>
              <p className="text-3xl font-bold">—</p>
              <p className="text-xs text-gray-400 mt-1">Coming soon</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
              <p className="text-3xl font-bold">$0.00</p>
              <p className="text-xs text-gray-400 mt-1">Coming soon</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Active Orders</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-gray-400 mt-1">Coming soon</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Total Courses</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-gray-400 mt-1">Coming soon</p>
            </div>
          </div>
        </section>

        {/* Admin Tools */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Admin Tools</h2>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <ul className="space-y-3 text-sm text-gray-600">
              <li>📊 Analytics (Coming soon)</li>
              <li>👥 User Management (Coming soon)</li>
              <li>📦 Product Management (Coming soon)</li>
              <li>📚 Course Management (Coming soon)</li>
              <li>📋 Order Management (Coming soon)</li>
              <li>⚙️ System Settings (Coming soon)</li>
            </ul>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
