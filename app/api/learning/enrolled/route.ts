import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { getEnrolledCoursesForUser } from '@/lib/learning/enrolled'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const courses = await getEnrolledCoursesForUser(userId)
    return NextResponse.json({ ok: true, courses })
  } catch (error) {
    console.error('[GET /api/learning/enrolled]', error)
    return NextResponse.json({ error: 'Failed to fetch enrolled courses' }, { status: 500 })
  }
}
