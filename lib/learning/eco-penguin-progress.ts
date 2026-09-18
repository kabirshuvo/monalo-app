import { getUnlockedStories } from '@/lib/read-a-story/data'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'
import {
  computePhonicsProgress,
  groupLabel,
  PHONICS_STICKERS,
  type PhonicsGroupId,
} from '@/lib/learning/phonics-progress'
import {
  getBalloonLettersMastery,
  getBlendWordMastery,
  getEcoPenguinStickers,
  getReadStoryMastery,
  getSegmentWordMastery,
} from '@/lib/points/service'
import { BALLOON_LETTERS_BASE_PATH } from '@/lib/balloon-letters/constants'
import { BLEND_WORD_BASE_PATH } from '@/lib/blend-the-word/constants'
import { READ_STORY_BASE_PATH } from '@/lib/read-a-story/constants'
import { SEGMENT_WORD_BASE_PATH } from '@/lib/segment-the-word/constants'

export type EcoPenguinParentProgress = {
  stickers: { id: string; label: string; emoji: string; earned: boolean }[]
  groups: {
    id: PhonicsGroupId
    label: string
    status: 'locked' | 'active' | 'done'
  }[]
  blendMastered: number
  segmentMastered: number
  storiesCompleted: number
  storiesUnlocked: number
  hubHref: string
  balloonsHref: string
  blendHref: string
  segmentHref: string
  storyHref: string
}

export async function getEcoPenguinParentProgress(
  userId: string
): Promise<EcoPenguinParentProgress> {
  const [balloons, stickers, blend, segment, stories] = await Promise.all([
    getBalloonLettersMastery(userId),
    getEcoPenguinStickers(userId),
    getBlendWordMastery(userId),
    getSegmentWordMastery(userId),
    getReadStoryMastery(userId),
  ])

  const progress = computePhonicsProgress(balloons.masteredKeys)
  const earned = new Set(stickers.earnedIds)
  const unlockedStories = await getUnlockedStories(balloons.masteredKeys)

  const stickerRows = PHONICS_STICKERS.map((s) => ({
    id: s.id,
    label: s.label,
    emoji: s.emoji,
    earned: earned.has(s.id),
  }))

  const groups = (['satpin', 'mdgock', 'eurhbf', 'rest'] as PhonicsGroupId[]).map((id) => {
    let status: 'locked' | 'active' | 'done' = 'locked'
    if (progress.completedGroupIds.includes(id)) status = 'done'
    else if (progress.unlockedGroupIds.includes(id)) status = 'active'
    return { id, label: groupLabel(id), status }
  })

  return {
    stickers: stickerRows,
    groups,
    blendMastered: blend.masteredKeys.length,
    segmentMastered: segment.masteredKeys.length,
    storiesCompleted: stories.completedIds.length,
    storiesUnlocked: unlockedStories.length,
    hubHref: LEARNING_HUB_PATH,
    balloonsHref: BALLOON_LETTERS_BASE_PATH,
    blendHref: BLEND_WORD_BASE_PATH,
    segmentHref: SEGMENT_WORD_BASE_PATH,
    storyHref: READ_STORY_BASE_PATH,
  }
}
