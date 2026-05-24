export const dynamic = 'force-dynamic'

import PublicLayout from '@/components/layouts/PublicLayout'
import CourseCard, { type Course } from '@/components/courses/CourseCard'
import EmptyState from '@/components/ui/EmptyState'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth-server'

export const metadata = {
  title: 'Courses - Monalo School',
  description: 'Learn skills that support your goals and Monalo School',
}

export default async function CoursesPage() {
  let userId: string | undefined
  try {
    const session = await auth()
    userId = session?.user ? (session.user as { id?: string }).id : undefined
  } catch (error) {
    console.error('[courses] session lookup failed:', error)
  }

  const rows = await prisma.course.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { lessons: true } },
      lessons: { where: { deletedAt: null }, select: { duration: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  let enrolledIds = new Set<string>()
  const progressByCourse: Record<string, number> = {}

  if (userId) {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId, deletedAt: null },
      select: { courseId: true },
    })
    enrolledIds = new Set(enrollments.map((e) => e.courseId))

    const completed = await prisma.userLessonProgress.findMany({
      where: { userId, deletedAt: null, completed: true },
      select: { courseId: true },
    })
    for (const p of completed) {
      progressByCourse[p.courseId] = (progressByCourse[p.courseId] || 0) + 1
    }
  }

  const courses: Course[] = rows.map((c) => {
    const totalLessons = c._count.lessons
    const completed = progressByCourse[c.id] || 0
    const progress =
      totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0
    const totalSeconds = c.lessons.reduce((s, l) => s + (l.duration || 0), 0)
    const hours = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const duration =
      totalSeconds > 0
        ? hours > 0
          ? `${hours}h ${mins}m`
          : `${mins}m`
        : undefined

    return {
      id: c.id,
      title: c.title,
      summary: c.description || '',
      duration,
      enrolled: enrolledIds.has(c.id),
      progress: enrolledIds.has(c.id) ? progress : undefined,
    }
  })

  return (
    <PublicLayout>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 space-y-3">
          <p className="text-sm font-semibold text-blue-600">Learn</p>
          <h1 className="text-3xl font-bold text-gray-900">Courses for focused learning</h1>
          <p className="text-gray-600 max-w-3xl">
            Build skills at your own pace. Enrolled courses show your progress here.
          </p>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            variant="courses-learner"
            title="No courses to show yet"
            description="New lessons are on the way. Visit the blog or shop while we prepare."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  )
}
