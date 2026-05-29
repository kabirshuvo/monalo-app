import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { prisma } from '@/lib/db'
import { awardLessonComplete, syncLearningMinutes } from '@/lib/points/service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id: lessonId } = await params
    const body = await request.json().catch(() => ({}))

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null },
      select: { id: true, title: true, courseId: true },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const watchedMinutes = Math.max(0, Math.floor(Number(body.watchedMinutes) || 0))
    const completed = Boolean(body.completed)

    const existing = await prisma.userLessonProgress.findFirst({
      where: { userId, lessonId, deletedAt: null },
    })

    const wasCompleted = existing?.completed ?? false

    const progress = existing
      ? await prisma.userLessonProgress.update({
          where: { id: existing.id },
          data: {
            watchedMinutes: Math.max(existing.watchedMinutes, watchedMinutes),
            completed: completed || existing.completed,
            completedAt:
              completed && !existing.completedAt ? new Date() : existing.completedAt,
          },
        })
      : await prisma.userLessonProgress.create({
          data: {
            userId,
            courseId: lesson.courseId,
            lessonId,
            watchedMinutes,
            completed,
            completedAt: completed ? new Date() : null,
          },
        })

    let pointsAwarded = 0

    if (watchedMinutes > 0) {
      const prevWatched = existing?.watchedMinutes ?? 0
      const addedMinutes = Math.max(0, watchedMinutes - prevWatched)
      if (addedMinutes > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { learningMinutes: { increment: addedMinutes } },
        })
      }
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { learningMinutes: true },
      })
      if (user) {
        const sync = await syncLearningMinutes(userId, user.learningMinutes)
        pointsAwarded += sync.pointsAwarded
      }
    }

    if (completed && !wasCompleted) {
      const lessonAward = await awardLessonComplete(userId, lessonId, lesson.title)
      if (lessonAward.awarded) {
        pointsAwarded += lessonAward.points
      }
    }

    return NextResponse.json({
      ok: true,
      progress: {
        lessonId: progress.lessonId,
        completed: progress.completed,
        watchedMinutes: progress.watchedMinutes,
        completedAt: progress.completedAt?.toISOString() ?? null,
      },
      pointsAwarded,
    })
  } catch (error) {
    console.error('[POST /api/lessons/:id/progress]', error)
    return NextResponse.json({ error: 'Failed to track progress' }, { status: 500 })
  }
}
