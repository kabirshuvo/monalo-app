import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import CourseProgress from '@/components/courses/CourseProgress'

export const metadata = {
  title: 'My Learning - MonAlo',
  description: 'Track your courses, lessons, and progress',
}

export default async function LearnerDashboardPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login')
  }

  const role = (session.user as any)?.role
  const level = (session.user as any)?.level ?? 1
  if (role !== 'LEARNER' && role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Fetch enrolled courses
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/learning/enrolled`, {
    cache: 'no-store',
    headers: { cookie: '' } // Pass session in production
  })
  const data = await res.json().catch(() => ({ ok: false }))
  const enrolledCourses: any[] = data?.courses || []

  const inProgressCount = enrolledCourses.filter((c) => c.completedLessons < c.totalLessons).length
  const completedCount = enrolledCourses.filter((c) => c.completedLessons === c.totalLessons).length
  const totalHours = enrolledCourses.reduce((sum, c) => sum + (c.totalLessons * 7 / 60), 0)

  return (
    <DashboardLayout
      userRole={(role as 'LEARNER' | 'ADMIN') || 'LEARNER'}
      userName={session.user.name || 'Learner'}
      userAvatar={session.user.image || undefined}
      currentPath="/dashboard/learning"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl font-light text-gray-900">Welcome back, {session.user.name?.split(' ')[0]}</h1>
          <p className="text-gray-600 mt-2 text-lg">Pick up where you left off</p>
        </div>

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
              onAction={() => {}}
            />
            <div className="text-center pb-6">
              <Link href="/courses">
                <Button>Explore courses</Button>
              </Link>
            </div>
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
                      <Link href={`/dashboard/learning/courses/${course.id}/lessons/l-001`}>
                        <Button size="sm">
                          {course.completedLessons > 0 ? 'Continue' : 'Start'}
                        </Button>
                      </Link>
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
