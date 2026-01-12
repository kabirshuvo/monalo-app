import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'

/**
 * GET /api/learning/enrolled
 * 
 * Returns user's enrolled courses with progress data.
 * For demo purposes, reads from enrollment localStorage keys and augments with mock progress.
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock enrolled courses with progress
    // In production: query UserLessonProgress via Prisma, aggregate by courseId
    const enrolledCourses = [
      {
        id: 'c-201',
        title: 'Learning Mindset',
        description: 'Build habits that keep you curious, consistent, and kind to yourself.',
        imageUrl: null,
        totalLessons: 3,
        completedLessons: 1,
        lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        enrolledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() // 7 days ago
      }
    ]

    return NextResponse.json({ ok: true, courses: enrolledCourses })
  } catch (error) {
    console.error('[GET /api/learning/enrolled]', error)
    return NextResponse.json({ error: 'Failed to fetch enrolled courses' }, { status: 500 })
  }
}
