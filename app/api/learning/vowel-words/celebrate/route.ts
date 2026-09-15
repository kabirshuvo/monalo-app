import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth-server'
import { getWordBySlug } from '@/lib/vowel-words/data'
import { awardVowelWordsCorrect, getPointsBreakdown } from '@/lib/points/service'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'

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

    const result = await awardVowelWordsCorrect(
      session.user.id,
      vowelId,
      wordSlug,
      word.word
    )
    const breakdown = await getPointsBreakdown(session.user.id)

    revalidatePath(VOWEL_WORDS_BASE_PATH)
    revalidatePath(`${VOWEL_WORDS_BASE_PATH}/${vowelId}`)

    return NextResponse.json({
      ok: true,
      awarded: result.awarded,
      points: result.points,
      alreadyMastered: !result.awarded,
      breakdown,
    })
  } catch (error) {
    console.error('[POST /api/learning/vowel-words/celebrate]', error)
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 })
  }
}
