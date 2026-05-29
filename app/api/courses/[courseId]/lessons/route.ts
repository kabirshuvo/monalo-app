import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { prisma } from '@/lib/db'

/**
 * GET /api/courses/:courseId/lessons
 * Returns lessons from the database and the user's completion state when signed in.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params

  const lessons = await prisma.lesson.findMany({
    where: { courseId, deletedAt: null },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      courseId: true,
      title: true,
      description: true,
      content: true,
      order: true,
      duration: true,
      videoUrl: true,
    },
  })

  const session = await auth()
  let completedLessonIds: string[] = []

  if (session?.user?.id) {
    const progress = await prisma.userLessonProgress.findMany({
      where: {
        userId: session.user.id,
        courseId,
        deletedAt: null,
        completed: true,
      },
      select: { lessonId: true },
    })
    completedLessonIds = progress.map((p) => p.lessonId)
  }

  return NextResponse.json({ ok: true, lessons, completedLessonIds })
}
