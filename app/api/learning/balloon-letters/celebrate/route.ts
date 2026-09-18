import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth-server'
import { BALLOON_LETTERS_BASE_PATH } from '@/lib/balloon-letters/constants'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'
import {
  computePhonicsProgress,
  getStickerForGroup,
  isGroupComplete,
  isPhonicsGroupId,
  type PhonicsGroupId,
} from '@/lib/learning/phonics-progress'
import { getLetterSoundById } from '@/lib/letter-sounds/data'
import { LETTER_SOUNDS_BASE_PATH } from '@/lib/letter-sounds/constants'
import {
  awardBalloonLettersCorrect,
  awardPhonicsGroupSticker,
  getBalloonLettersMastery,
  getPointsBreakdown,
} from '@/lib/points/service'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json().catch(() => ({}))
    const letterId = String(body.letterId ?? '').trim()
    if (!letterId) {
      return NextResponse.json({ error: 'Missing letterId' }, { status: 400 })
    }
    const letter = await getLetterSoundById(letterId)
    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 })
    }

    const result = await awardBalloonLettersCorrect(session.user.id, letter.id, letter.letter)
    const mastery = await getBalloonLettersMastery(session.user.id)
    const progress = computePhonicsProgress(mastery.masteredKeys)

    let stickerAwarded = false
    let alreadyHadSticker = false
    let stickerPoints = 0
    let stickerId: string | null = null
    let stickerLabel: string | null = null
    let stickerEmoji: string | null = null
    let nextGroupId: PhonicsGroupId | null = null
    let completedGroupId: PhonicsGroupId | null = null
    let groupComplete = false

    const groupId = letter.group
    if (isPhonicsGroupId(groupId) && isGroupComplete(groupId, mastery.masteredKeys)) {
      groupComplete = true
      completedGroupId = groupId
      const sticker = getStickerForGroup(groupId)
      if (sticker) {
        const gift = await awardPhonicsGroupSticker(session.user.id, sticker.id, sticker.label)
        stickerAwarded = gift.awarded
        alreadyHadSticker = !gift.awarded
        stickerPoints = gift.awarded ? gift.points : 0
        stickerId = sticker.id
        stickerLabel = sticker.label
        stickerEmoji = sticker.emoji
      }
      const after = computePhonicsProgress(mastery.masteredKeys)
      nextGroupId =
        after.unlockedGroupIds.find((id) => !after.completedGroupIds.includes(id)) ?? null
    }

    const breakdown = await getPointsBreakdown(session.user.id)
    revalidatePath(BALLOON_LETTERS_BASE_PATH)
    revalidatePath(LETTER_SOUNDS_BASE_PATH)
    revalidatePath(LEARNING_HUB_PATH)

    return NextResponse.json({
      ok: true,
      awarded: result.awarded,
      points: result.points,
      alreadyMastered: !result.awarded,
      breakdown,
      progress,
      groupComplete,
      stickerAwarded,
      alreadyHadSticker,
      stickerPoints,
      stickerId,
      stickerLabel,
      stickerEmoji,
      completedGroupId,
      nextGroupId,
    })
  } catch (error) {
    console.error('[POST /api/learning/balloon-letters/celebrate]', error)
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 })
  }
}
