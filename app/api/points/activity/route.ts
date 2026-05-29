import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { syncBlogReadingMinutes, syncLearningMinutes, getPointsBreakdown } from '@/lib/points/service'

type ActivityType = 'blog' | 'learning'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const type = body.type as ActivityType
    const minutes = Math.max(0, Math.floor(Number(body.minutes) || 0))

    if (!['blog', 'learning'].includes(type)) {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 })
    }

    if (minutes > 24 * 60) {
      return NextResponse.json({ error: 'Invalid minutes value' }, { status: 400 })
    }

    const userId = session.user.id
    let pointsAwarded = 0

    if (type === 'blog') {
      const result = await syncBlogReadingMinutes(userId, minutes)
      pointsAwarded = result.pointsAwarded
    } else {
      const result = await syncLearningMinutes(userId, minutes)
      pointsAwarded = result.pointsAwarded
    }

    const breakdown = await getPointsBreakdown(userId)

    return NextResponse.json({
      ok: true,
      pointsAwarded,
      breakdown,
    })
  } catch (error) {
    console.error('[POST /api/points/activity]', error)
    return NextResponse.json({ error: 'Failed to record activity' }, { status: 500 })
  }
}
