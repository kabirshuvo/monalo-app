import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { prisma } from '@/lib/db'
import { formatPriceCents } from '@/lib/format'

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

  const [userCount, productCount, pendingOrders, revenueAgg] = await Promise.all([
    prisma.user.count(),
    prisma.product.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
    prisma.order.count({ where: { deletedAt: null, status: 'PENDING' } }),
    prisma.order.aggregate({
      where: { deletedAt: null, paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
    }),
  ])

  const revenue = revenueAgg._sum.totalAmount ?? 0

  const recentUsers = await prisma.user.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total users</p>
              <p className="text-3xl font-bold text-gray-900">{userCount}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Active products</p>
              <p className="text-3xl font-bold text-gray-900">{productCount}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Paid revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatPriceCents(revenue)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Pending orders</p>
              <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
            </div>
          </div>
        </section>

        {/* Users List */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">People on the platform</h2>
          <div className="overflow-hidden rounded-lg border border-gray-100 shadow-xs bg-white">
            {recentUsers.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <RoleBadge role={user.role as 'ADMIN' | 'WRITER' | 'LEARNER' | 'CUSTOMER' | 'SELLER'} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
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
                <span>👥 Users & roles</span>
                <Link href="/dashboard/admin/users">
                  <Button size="sm" variant="secondary">Manage users</Button>
                </Link>
              </li>
              <li className="flex items-center justify-between">
                <span>🎨 Gallery review</span>
                <Link href="/dashboard/admin/artworks">
                  <Button size="sm" variant="secondary">Review artworks</Button>
                </Link>
              </li>
              <li className="flex items-center justify-between">
                <span>📦 Shop products</span>
                <Link href="/dashboard/admin/products">
                  <Button size="sm" variant="secondary">Manage products</Button>
                </Link>
              </li>
              <li className="flex items-center justify-between">
                <span>🛍️ Shop orders</span>
                <Link href="/dashboard/admin/orders">
                  <Button size="sm" variant="secondary">Fulfill orders</Button>
                </Link>
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

function RoleBadge({ role }: { role: 'ADMIN' | 'WRITER' | 'LEARNER' | 'CUSTOMER' | 'SELLER' }) {
  const variant =
    role === 'ADMIN'
      ? 'danger'
      : role === 'WRITER'
        ? 'info'
        : role === 'LEARNER'
          ? 'success'
          : role === 'SELLER'
            ? 'warning'
            : 'default'

  return <Badge variant={variant} size="sm">{role}</Badge>
}
