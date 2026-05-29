import { prisma } from '@/lib/db'

export type EnrolledCourseSummary = {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  totalLessons: number
  completedLessons: number
  /** First incomplete lesson by order, or first lesson if none started */
  resumeLessonId: string | null
  lastAccessed: string
  enrolledAt: string
}

export async function getEnrolledCoursesForUser(userId: string): Promise<EnrolledCourseSummary[]> {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId, deletedAt: null },
    include: { course: true },
    orderBy: { enrolledAt: 'desc' },
  })

  const courseIds = enrollments.map((e) => e.courseId)
  const progressRows = await prisma.userLessonProgress.findMany({
    where: {
      userId,
      courseId: { in: courseIds },
      deletedAt: null,
    },
    select: { courseId: true, lessonId: true, completed: true, updatedAt: true },
  })

  const completedByCourse = progressRows.reduce<Record<string, number>>((acc, row) => {
    if (row.completed) {
      acc[row.courseId] = (acc[row.courseId] || 0) + 1
    }
    return acc
  }, {})

  const completedLessonIdsByCourse = progressRows.reduce<Record<string, Set<string>>>((acc, row) => {
    if (!row.completed) return acc
    if (!acc[row.courseId]) acc[row.courseId] = new Set()
    acc[row.courseId].add(row.lessonId)
    return acc
  }, {})

  const lastAccessedByCourse = progressRows.reduce<Record<string, Date>>((acc, row) => {
    const prev = acc[row.courseId]
    if (!prev || row.updatedAt > prev) {
      acc[row.courseId] = row.updatedAt
    }
    return acc
  }, {})

  return Promise.all(
    enrollments.map(async (e) => {
      const courseLessons = await prisma.lesson.findMany({
        where: { courseId: e.courseId, deletedAt: null },
        orderBy: { order: 'asc' },
        select: { id: true },
      })
      const totalLessons = courseLessons.length
      const completedLessons = completedByCourse[e.courseId] || 0
      const completedSet = completedLessonIdsByCourse[e.courseId] ?? new Set<string>()
      const resumeLesson =
        courseLessons.find((l) => !completedSet.has(l.id)) ?? courseLessons[0] ?? null

      return {
        id: e.course.id,
        title: e.course.title,
        description: e.course.description,
        imageUrl: e.course.imageUrl,
        totalLessons,
        completedLessons,
        resumeLessonId: resumeLesson?.id ?? null,
        lastAccessed: (lastAccessedByCourse[e.courseId] ?? e.enrolledAt).toISOString(),
        enrolledAt: e.enrolledAt.toISOString(),
      }
    })
  )
}
