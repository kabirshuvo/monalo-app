import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth-server'
import { BLEND_WORD_BASE_PATH } from '@/lib/blend-the-word/constants'
import { getBlendWordById } from '@/lib/blend-the-word/data'
import { awardBlendWordCorrect, getPointsBreakdown } from '@/lib/points/service'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json().catch(() => ({}))
    const wordId = String(body.wordId ?? '').trim()
    if (!wordId) {
      return NextResponse.json({ error: 'Missing wordId' }, { status: 400 })
    }
    const word = await getBlendWordById(wordId)
    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }
    const result = await awardBlendWordCorrect(session.user.id, word.id, word.word)
    const breakdown = await getPointsBreakdown(session.user.id)
    revalidatePath(BLEND_WORD_BASE_PATH)
    return NextResponse.json({
      ok: true,
      awarded: result.awarded,
      points: result.points,
      alreadyMastered: !result.awarded,
      breakdown,
    })
  } catch (error) {
    console.error('[POST /api/learning/blend-the-word/celebrate]', error)
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 })
  }
}
