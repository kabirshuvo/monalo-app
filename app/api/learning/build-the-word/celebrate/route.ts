import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth-server'
import { getWordBySlug } from '@/lib/vowel-words/data'
import { awardBuildWordCorrect, getPointsBreakdown } from '@/lib/points/service'
import { BUILD_WORD_BASE_PATH } from '@/lib/build-word/session'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json().catch(() => ({}))
    const vowelId = String(body.vowelId ?? '').trim()
    const wordSlug = String(body.wordSlug ?? '').trim()
    if (!vowelId || !wordSlug) {
      return NextResponse.json({ error: 'Missing vowelId or wordSlug' }, { status: 400 })
    }
    const word = await getWordBySlug(vowelId, wordSlug)
    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }
    const result = await awardBuildWordCorrect(
      session.user.id,
      vowelId,
      wordSlug,
      word.word
    )
    const breakdown = await getPointsBreakdown(session.user.id)
    revalidatePath(BUILD_WORD_BASE_PATH)
    revalidatePath(`${BUILD_WORD_BASE_PATH}/${vowelId}`)
    return NextResponse.json({
      ok: true,
      awarded: result.awarded,
      points: result.points,
      alreadyMastered: !result.awarded,
      breakdown,
    })
  } catch (error) {
    console.error('[POST /api/learning/build-the-word/celebrate]', error)
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 })
  }
}
