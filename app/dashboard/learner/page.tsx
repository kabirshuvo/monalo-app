import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'

export const metadata = {
  title: 'Learner Dashboard - MonAlo',
  description: 'Track your courses and learning progress',
}

/**
 * Learner Dashboard Page
 * 
 * Protected page for learners to view courses, progress, and achievements.
 * Server-side auth check redirects unauthenticated users to /login
 * and unauthorized users back to /dashboard
 */
export default async function DashboardLearner() {
  const session = await auth()

  // Redirect unauthenticated users to login
  if (!session || !session.user) {
    redirect('/login')
  }

  // Only LEARNER and ADMIN roles can access
  if (session.user.role !== 'LEARNER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout
      userRole={session.user.role as 'LEARNER' | 'ADMIN'}
      userName={session.user.name || 'Learner'}
      currentPath="/dashboard/learner"
    >
      <div className="space-y-8">
        {/* Quick Stats */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">My Courses</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-gray-400 mt-1">Enrolled courses</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">In Progress</p>
              <p className="text-3xl font-bold">0%</p>
              <p className="text-xs text-gray-400 mt-1">Average completion</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Certificates</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-gray-400 mt-1">Earned</p>
            </div>
          </div>
        </section>

        {/* Learning Path */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Learning Path</h2>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <ul className="space-y-3 text-sm text-gray-600">
              <li>📚 My Courses (Coming soon)</li>
              <li>📖 Course Lessons (Coming soon)</li>
              <li>✅ Quizzes & Assignments (Coming soon)</li>
              <li>🏆 Achievements (Coming soon)</li>
              <li>💬 Discussion Forums (Coming soon)</li>
            </ul>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
