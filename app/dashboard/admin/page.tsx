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

        {/* Users List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold">People</h2>
              <p className="text-sm text-gray-600">Who can access MonAlo and what they can do.</p>
            </div>
            <Badge variant="info" size="sm">Admin view</Badge>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                title="No people yet"
                description="Invite teammates when you are ready. Roles help you keep access tidy."
              />
            )}
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
