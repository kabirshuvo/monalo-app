import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'

/**
 * POST /api/lessons/:id/progress
 * 
 * Track user lesson progress.
 * Body: { completed?: boolean, watchedMinutes?: number }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: lessonId } = await params
    const body = await request.json().catch(() => ({}))
    
    // For now, just echo back success
    // In production: update UserLessonProgress via Prisma
    const progress = {
      lessonId,
      userId: (session.user as any).id || 'demo',
      completed: body.completed || false,
      watchedMinutes: body.watchedMinutes || 0,
      completedAt: body.completed ? new Date().toISOString() : null
    }

    return NextResponse.json({ ok: true, progress })
  } catch (error) {
    console.error('[POST /api/lessons/:id/progress]', error)
    return NextResponse.json({ error: 'Failed to track progress' }, { status: 500 })
  }
}
