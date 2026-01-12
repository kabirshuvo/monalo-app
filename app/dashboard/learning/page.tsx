import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'

export const metadata = {
  title: 'My Learning - MonAlo',
  description: 'Track your courses, lessons, and progress',
}

export default async function LearnerDashboardPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login')
  }

  if (session.user.role !== 'LEARNER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout
      userRole={session.user.role as 'LEARNER' | 'ADMIN'}
      userName={session.user.name || 'Learner'}
      userAvatar={session.user.image || undefined}
      currentPath="/dashboard/learning"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Learning Journey</h1>
          <p className="text-gray-600 mt-2">Continue where you left off</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-2">courses</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-2">courses</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Hours</div>
            <div className="text-3xl font-bold text-gray-900">0h</div>
            <p className="text-xs text-gray-500 mt-2">learning time</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Your Level</div>
            <div className="text-3xl font-bold text-gray-900">{session.user.level || 1}</div>
            <p className="text-xs text-gray-500 mt-2">current level</p>
          </div>
        </div>

        {/* Placeholder content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your courses will appear here</h2>
          <p className="text-gray-600 mb-4">Once you enroll in a course, you'll see your progress tracked here.</p>
          <a 
            href="/courses" 
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore courses
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
