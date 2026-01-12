import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'

export const metadata = {
  title: 'Customer Dashboard - MonAlo',
  description: 'Manage your purchases and account',
}

/**
 * Customer Dashboard Page
 * 
 * Protected page for customers to manage orders, payments, and account.
 * Server-side auth check redirects unauthenticated users to /login
 * and unauthorized users back to /dashboard
 */
export default async function DashboardCustomer() {
  const session = await auth()

  // Redirect unauthenticated users to login
  if (!session || !session.user) {
    redirect('/login')
  }

  // Only CUSTOMER and ADMIN roles can access
  if (session.user.role !== 'CUSTOMER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout
      userRole={session.user.role as 'CUSTOMER' | 'ADMIN'}
      userName={session.user.name || 'Customer'}
      currentPath="/dashboard/customer"
    >
      <div className="space-y-8">
        {/* Quick Stats */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">My Orders</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-gray-400 mt-1">Active purchases</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Total Spent</p>
              <p className="text-3xl font-bold">$0.00</p>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Reward Points</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-gray-400 mt-1">Account balance</p>
            </div>
          </div>
        </section>

        {/* Activity */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Activity</h2>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <ul className="space-y-3 text-sm text-gray-600">
              <li>🛍️ Recent Orders (Coming soon)</li>
              <li>🎁 Wishlist (Coming soon)</li>
              <li>📦 Track Shipments (Coming soon)</li>
              <li>💳 Payment Methods (Coming soon)</li>
              <li>📋 Account Settings (Coming soon)</li>
            </ul>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
