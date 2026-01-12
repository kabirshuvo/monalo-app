import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import EmptyState from '@/components/ui/EmptyState'

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
  const role = (session.user as any)?.role
  if (role !== 'CUSTOMER' && role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout
      userRole={(role as 'CUSTOMER' | 'ADMIN') || 'CUSTOMER'}
      userName={session.user.name || 'Customer'}
      currentPath="/dashboard/customer"
    >
      <div className="space-y-12">
        <div className="mb-10">
          <h1 className="text-4xl font-light text-gray-900">Your account</h1>
          <p className="text-gray-600 mt-2 text-lg">Orders, purchases, and settings</p>
        </div>

        {/* Orders Section */}
        <seEmptyState
            variant="orders"
            title="Ready to explore?"
            description="When you purchase something, your orders will show up here. No pressure—take your time."
            actionLabel="Browse our shop"
            onAction={() => {}}
          //div>
            </div>
          </div>
        </section>

        {/* Account Overview */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Account overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div classNamebg-white rounded-lg p-8 border border-gray-100 shadow-xs space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-700 font-medium">Quick stats</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total orders</span>
                  <span className="text-lg font-semibold text-gray-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount spent</span>
                  <span className="text-lg font-semibold text-gray-900">$0.00</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-50 pt-4">
              <p className="text-sm text-gray-700 font-medium mb-3">More feature
                <li>💳 Payment methods (Coming soon)</li>
                <li>📦 Shipping addresses (Coming soon)</li>
                <li>⚙️ Account settings (Coming soon)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
