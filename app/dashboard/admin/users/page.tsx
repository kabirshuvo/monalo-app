import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { prisma } from '@/lib/db'
import AdminUserRoleSelect from '@/components/admin/AdminUserRoleSelect'
import RoleApplicationReviewCard from '@/components/admin/RoleApplicationReviewCard'
import Badge from '@/components/ui/Badge'
import type { Role } from '@prisma/client'

export const metadata = {
  title: 'Users & Roles - MonAlo Admin',
}

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if ((session.user as { role?: Role }).role !== 'ADMIN') redirect('/dashboard')

  const [users, pendingApplications] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.roleApplication.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <DashboardLayout
      userRole="ADMIN"
      userName={session.user.name || 'Admin'}
      currentPath="/dashboard/admin/users"
    >
      <div className="space-y-10">
        <div>
          <Link href="/dashboard/admin" className="text-sm text-blue-600 hover:underline">
            ← Admin dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-light text-gray-900">Users & roles</h1>
          <p className="mt-2 text-gray-600">
            Change roles directly or review applications from the profile page.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Pending role applications</h2>
            <Badge variant="warning" size="sm">
              {pendingApplications.length} pending
            </Badge>
          </div>
          {pendingApplications.length === 0 ? (
            <p className="text-sm text-gray-500">No pending applications right now.</p>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <RoleApplicationReviewCard key={application.id} application={application} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Registered users</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{user.name ?? '—'}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <AdminUserRoleSelect userId={user.id} currentRole={user.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
