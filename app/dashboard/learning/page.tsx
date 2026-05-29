import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import CourseProgress from '@/components/courses/CourseProgress'
import ActivityTracker from '@/components/points/ActivityTracker'
import { getEnrolledCoursesForUser } from '@/lib/learning/enrolled'
import { getUserAvatarFromSession } from '@/lib/auth/user-avatar'

export const metadata = {
  title: 'My Learning - MonAlo',
  description: 'Track your courses, lessons, and progress',
}

export default async function LearnerDashboardPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login')
  }

  const role = session.user.role
  const level = (session.user as { level?: number }).level ?? 1
  if (role !== 'LEARNER' && role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const userId = session.user.id
  const enrolledCourses = userId ? await getEnrolledCoursesForUser(userId) : []

  const inProgressCount = enrolledCourses.filter((c) => c.completedLessons < c.totalLessons).length
  const completedCount = enrolledCourses.filter((c) => c.completedLessons === c.totalLessons).length
  const totalHours = enrolledCourses.reduce((sum, c) => sum + (c.totalLessons * 7 / 60), 0)

  return (
    <DashboardLayout
      userRole={(role as 'LEARNER' | 'ADMIN') || 'LEARNER'}
      userName={session.user.name || 'Learner'}
      userAvatar={getUserAvatarFromSession(session)}
      currentPath="/dashboard/learning"
    >
      <ActivityTracker type="learning" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl font-light text-gray-900">Welcome back, {session.user.name?.split(' ')[0]}</h1>
          <p className="text-gray-600 mt-2 text-lg">Pick up where you left off</p>
        </div>

        <Card className="mb-12 border-teal-200 bg-gradient-to-r from-sky-50 to-teal-50">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6">
            <div>
              <p className="text-2xl mb-1" aria-hidden>🐧</p>
              <h2 className="text-lg font-semibold text-teal-900">Eco Penguin</h2>
              <p className="text-sm text-teal-800/80 mt-1">
                Early English games — This Is &amp; Which Is, rebuilt for MonAlo.
              </p>
            </div>
            <Link href="/learning/ecopenguin">
              <Button>Open Eco Penguin</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Progress at a Glance */}
        <div className="mb-16">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">Your progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{inProgressCount}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Hours spent</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(totalHours)}h</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Your level</p>
              <p className="text-3xl font-bold text-gray-900">{level}</p>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        {enrolledCourses.length === 0 ? (
          <Card>
            <EmptyState
              variant="courses-learner"
              title="Your learning journey starts here"
              description="Browse courses and enroll to begin tracking your progress."
              actionLabel="Explore courses"
              actionHref="/courses"
            />
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Continue learning</h2>
              <Link href="/courses" className="text-sm text-blue-600 hover:text-blue-800">
                Browse more →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {enrolledCourses.map((course) => (
                <Card key={course.id} hover>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle>{course.title}</CardTitle>
                        {course.description && (
                          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        )}
                      </div>
                      {course.resumeLessonId ? (
                        <Link
                          href={`/dashboard/learning/courses/${course.id}/lessons/${course.resumeLessonId}`}
                        >
                          <Button size="sm">
                            {course.completedLessons > 0 ? 'Continue' : 'Start'}
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" disabled>
                          No lessons yet
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CourseProgress
                      completed={course.completedLessons}
                      total={course.totalLessons}
                      variant="compact"
                    />
                    {course.lastAccessed && (
                      <p className="text-xs text-gray-500 mt-3">
                        Last accessed {new Date(course.lastAccessed).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
