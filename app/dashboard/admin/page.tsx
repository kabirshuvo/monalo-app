import { requireServerRole, getServerUserRole } from '@/lib/auth/server-role'

/**
 * Admin Dashboard Page
 * 
 * Protected page that only admins can access.
 * Automatically redirects unauthorized users to /home
 * Automatically redirects unauthenticated users to /login
 */
export default async function DashboardAdmin() {
  // Protect this page - only ADMIN role can access
  // This will redirect if user is not authenticated or lacks ADMIN role
  const session = await requireServerRole('ADMIN')
  const userRole = await getServerUserRole()

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome, {(session.user as any)?.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard
            title="Total Users"
            value="—"
            description="Coming soon"
          />
          <DashboardCard
            title="Total Revenue"
            value="$0.00"
            description="Coming soon"
          />
          <DashboardCard
            title="Active Orders"
            value="0"
            description="Coming soon"
          />
          <DashboardCard
            title="Total Courses"
            value="0"
            description="Coming soon"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Admin Tools</h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <ul className="space-y-3 text-sm">
              <li>📊 Analytics (Coming soon)</li>
              <li>👥 User Management (Coming soon)</li>
              <li>📦 Product Management (Coming soon)</li>
              <li>📚 Course Management (Coming soon)</li>
              <li>📋 Order Management (Coming soon)</li>
              <li>⚙️ System Settings (Coming soon)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
          <strong>Session Info (Admin Only):</strong>
          <ul className="mt-2 space-y-1 font-mono text-xs">
            <li>Role: {userRole}</li>
            <li>Email: {(session.user as any)?.email}</li>
            <li>Session expires: {new Date(session.expires).toLocaleDateString()}</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  )
}
