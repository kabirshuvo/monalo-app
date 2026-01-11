import { requireServerRole, getServerUserRole } from '@/lib/auth/server-role'

/**
 * Learner Dashboard Page
 * 
 * Protected page that only learners can access.
 * Automatically redirects unauthorized users to /home
 * Automatically redirects unauthenticated users to /login
 */
export default async function DashboardLearner() {
  // Protect this page - only LEARNER role can access
  // This will redirect if user is not authenticated or lacks LEARNER role
  const session = await requireServerRole('LEARNER')
  const userRole = await getServerUserRole()

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Learner Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome, {(session.user as any)?.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <DashboardCard
            title="My Courses"
            value="0"
            description="Enrolled courses"
          />
          <DashboardCard
            title="In Progress"
            value="0%"
            description="Average completion"
          />
          <DashboardCard
            title="Certificates"
            value="0"
            description="Earned"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Learning Path</h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <ul className="space-y-3 text-sm">
              <li>📚 My Courses (Coming soon)</li>
              <li>📖 Course Lessons (Coming soon)</li>
              <li>✅ Quizzes & Assignments (Coming soon)</li>
              <li>🏆 Achievements (Coming soon)</li>
              <li>💬 Discussion Forums (Coming soon)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded text-sm text-purple-900">
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
