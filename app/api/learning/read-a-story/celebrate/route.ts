import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth-server'
import { getStoryById } from '@/lib/read-a-story/data'
import { READ_STORY_BASE_PATH } from '@/lib/read-a-story/constants'
import { awardReadStoryComplete, getPointsBreakdown } from '@/lib/points/service'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json().catch(() => ({}))
    const storyId = String(body.storyId ?? '').trim()
    const story = await getStoryById(storyId)
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }
    const result = await awardReadStoryComplete(session.user.id, story.id, story.title)
    const breakdown = await getPointsBreakdown(session.user.id)
    revalidatePath(READ_STORY_BASE_PATH)
    return NextResponse.json({
      ok: true,
      awarded: result.awarded,
      points: result.points,
      alreadyMastered: !result.awarded,
      breakdown,
    })
  } catch (error) {
    console.error('[POST /api/learning/read-a-story/celebrate]', error)
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 })
  }
}
