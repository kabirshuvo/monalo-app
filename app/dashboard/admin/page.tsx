import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'

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
  const role = (session.user as any)?.role
  if (role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users: Array<{
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'WRITER' | 'LEARNER' | 'CUSTOMER'
    status: 'active' | 'invited'
    joined: string
  }> = [
    {
      id: 'u-1001',
      name: 'Lena Rivers',
      email: 'lena@monalo.com',
      role: 'ADMIN',
      status: 'active',
      joined: 'Jan 02, 2026'
    },
    {
      id: 'u-1002',
      name: 'Casey Morgan',
      email: 'casey@monalo.com',
      role: 'WRITER',
      status: 'active',
      joined: 'Dec 18, 2025'
    },
    {
      id: 'u-1003',
      name: 'Jade Patel',
      email: 'jade@monalo.com',
      role: 'LEARNER',
      status: 'invited',
      joined: '—'
    }
  ]

  return (
    <DashboardLayout
      userRole="ADMIN"
      userName={session.user.name || 'Admin'}
      currentPath="/dashboard/admin"
    >
      <div className="space-y-12">
        <div className="mb-10">
          <h1 className="text-4xl font-light text-gray-900">Platform dashboard</h1>
          <p className="text-gray-600 mt-2 text-lg">Overview and management tools</p>
        </div>

        {/* Key Metrics */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">At a glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total users</p>
              <p className="text-3xl font-bold text-gray-900">—</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total revenue</p>
              <p className="text-3xl font-bold text-gray-900">$0.00</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Active orders</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </section>

        {/* Users List */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">People on the platform</h2>
          <div className="overflow-hidden rounded-lg border border-gray-100 shadow-xs bg-white">
            {users.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                variant="generic"
                title="Your team will grow here"
                description="When you invite team members, they'll appear on this dashboard. No rush—add them when you're ready."
              />
            )}
          </div>
        </section>

        {/* Admin Tools */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Platform management</h2>
          <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-xs">
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-center justify-between">
                <span>📊 Analytics</span>
                <span className="text-xs text-gray-400">Coming soon</span>
              </li>
              <li className="flex items-center justify-between">
                <span>📦 Products</span>
                <span className="text-xs text-gray-400">Coming soon</span>
              </li>
              <li className="flex items-center justify-between">
                <span>📚 Courses</span>
                <span className="text-xs text-gray-400">Coming soon</span>
              </li>
              <li className="flex items-center justify-between">
                <span>⚙️ Settings</span>
                <span className="text-xs text-gray-400">Coming soon</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

function RoleBadge({ role }: { role: 'ADMIN' | 'WRITER' | 'LEARNER' | 'CUSTOMER' }) {
  const variant =
    role === 'ADMIN'
      ? 'danger'
      : role === 'WRITER'
      ? 'info'
      : role === 'LEARNER'
      ? 'success'
      : 'default'

  return <Badge variant={variant} size="sm">{role}</Badge>
}

function StatusBadge({ status }: { status: 'active' | 'invited' }) {
  const variant = status === 'active' ? 'success' : 'warning'
  const label = status === 'active' ? 'Active' : 'Invited'
  return <Badge variant={variant} size="sm">{label}</Badge>
}
