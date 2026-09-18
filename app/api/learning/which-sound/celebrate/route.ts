import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth-server'
import { getLetterSoundById } from '@/lib/letter-sounds/data'
import { WHICH_SOUND_BASE_PATH } from '@/lib/which-sound/constants'
import { awardWhichSoundCorrect, getPointsBreakdown } from '@/lib/points/service'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json().catch(() => ({}))
    const letterId = String(body.letterId ?? '').trim()
    const letter = await getLetterSoundById(letterId)
    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 })
    }
    const result = await awardWhichSoundCorrect(session.user.id, letter.id, letter.letter)
    const breakdown = await getPointsBreakdown(session.user.id)
    revalidatePath(WHICH_SOUND_BASE_PATH)
    return NextResponse.json({
      ok: true,
      awarded: result.awarded,
      points: result.points,
      alreadyMastered: !result.awarded,
      breakdown,
    })
  } catch (error) {
    console.error('[POST /api/learning/which-sound/celebrate]', error)
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 })
  }
}
