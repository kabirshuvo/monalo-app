import { requireServerRole, getServerUserRole } from '@/lib/auth/server-role'

/**
 * Writer Dashboard Page
 * 
 * Protected page that only writers can access.
 * Automatically redirects unauthorized users to /home
 * Automatically redirects unauthenticated users to /login
 */
export default async function DashboardWriter() {
  // Protect this page - only WRITER role can access
  // This will redirect if user is not authenticated or lacks WRITER role
  const session = await requireServerRole('WRITER')
  const userRole = await getServerUserRole()

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Writer Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome, {(session.user as any)?.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <DashboardCard
            title="My Content"
            value="0"
            description="Published items"
          />
          <DashboardCard
            title="Drafts"
            value="0"
            description="Work in progress"
          />
          <DashboardCard
            title="Total Views"
            value="0"
            description="All content"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Content Management</h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <ul className="space-y-3 text-sm">
              <li>✏️ Create New Content (Coming soon)</li>
              <li>📝 My Posts (Coming soon)</li>
              <li>👁️ View Analytics (Coming soon)</li>
              <li>💬 Reader Comments (Coming soon)</li>
              <li>📊 Performance (Coming soon)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded text-sm text-orange-900">
          <strong>Session Info:</strong>
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
