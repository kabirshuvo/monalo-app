import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId, deletedAt: null },
      include: {
        course: true,
      },
      orderBy: { enrolledAt: 'desc' },
    })

    const courseIds = enrollments.map((e) => e.courseId)
    const progressRows = await prisma.userLessonProgress.findMany({
      where: {
        userId,
        courseId: { in: courseIds },
        deletedAt: null,
        completed: true,
      },
      select: { courseId: true },
    })

    const completedByCourse = progressRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.courseId] = (acc[row.courseId] || 0) + 1
      return acc
    }, {})

    const courses = await Promise.all(
      enrollments.map(async (e) => {
      const totalLessons = await prisma.lesson.count({
        where: { courseId: e.courseId, deletedAt: null },
      })
      const completedLessons = completedByCourse[e.courseId] || 0
      return {
        id: e.course.id,
        title: e.course.title,
        description: e.course.description,
        imageUrl: e.course.imageUrl,
        totalLessons,
        completedLessons,
        lastAccessed: e.enrolledAt.toISOString(),
        enrolledAt: e.enrolledAt.toISOString(),
      }
    })
    )

    return NextResponse.json({ ok: true, courses })
  } catch (error) {
    console.error('[GET /api/learning/enrolled]', error)
    return NextResponse.json({ error: 'Failed to fetch enrolled courses' }, { status: 500 })
  }
}
