import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth-server'
import { getDigraphWordBySlug } from '@/lib/digraphs/data'
import { awardDigraphsCorrect, getPointsBreakdown } from '@/lib/points/service'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const digraphId = String(body.digraphId ?? '').trim()
    const wordSlug = String(body.wordSlug ?? '').trim()

    if (!digraphId || !wordSlug) {
      return NextResponse.json({ error: 'Missing digraphId or wordSlug' }, { status: 400 })
    }

    const word = await getDigraphWordBySlug(digraphId, wordSlug)
    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    const result = await awardDigraphsCorrect(
      session.user.id,
      digraphId,
      wordSlug,
      word.word
    )
    const breakdown = await getPointsBreakdown(session.user.id)

    revalidatePath(DIGRAPHS_BASE_PATH)
    revalidatePath(`${DIGRAPHS_BASE_PATH}/${digraphId}`)

    return NextResponse.json({
      ok: true,
      awarded: result.awarded,
      points: result.points,
      alreadyMastered: !result.awarded,
      breakdown,
    })
  } catch (error) {
    console.error('[POST /api/learning/digraphs/celebrate]', error)
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 })
  }
}
