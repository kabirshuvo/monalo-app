import { getUnlockedStories } from '@/lib/read-a-story/data'
import { getSightWords } from '@/lib/sight-words/data'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'
import {
  computePhonicsProgress,
  groupLabel,
  PHONICS_STICKERS,
  type PhonicsGroupId,
} from '@/lib/learning/phonics-progress'
import {
  recommendNextRoom,
  type LearningPathSignals,
  type NextForYou,
} from '@/lib/learning/learning-path'
import {
  getBalloonLettersMastery,
  getBlendWordMastery,
  getConsonantBlendsMastery,
  getEcoPenguinStickers,
  getNurseryRhymeMastery,
  getReadStoryMastery,
  getSayItMastery,
  getSegmentWordMastery,
  getSightWordsMastery,
  type LearnerScope,
} from '@/lib/points/service'
import { BALLOON_LETTERS_BASE_PATH } from '@/lib/balloon-letters/constants'
import { BLEND_WORD_BASE_PATH } from '@/lib/blend-the-word/constants'
import { READ_STORY_BASE_PATH } from '@/lib/read-a-story/constants'
import { SEGMENT_WORD_BASE_PATH } from '@/lib/segment-the-word/constants'
import { SIGHT_WORDS_BASE_PATH } from '@/lib/sight-words/constants'
import { NURSERY_RHYME_BASE_PATH } from '@/lib/nursery-rhyme/constants'
import { CONSONANT_BLENDS_BASE_PATH } from '@/lib/consonant-blends/constants'
import { SAY_IT_BASE_PATH } from '@/lib/say-it/constants'
import { ECO_PENGUIN_PROGRAM } from '@/lib/learning/cambridge-esl'

export type EcoPenguinParentProgress = {
  stickers: { id: string; label: string; emoji: string; earned: boolean }[]
  groups: {
    id: PhonicsGroupId
    label: string
    status: 'locked' | 'active' | 'done'
  }[]
  blendMastered: number
  segmentMastered: number
  sightMastered: number
  sightTotal: number
  nurseryRhymeMastered: number
  sayItMastered: number
  consonantBlendsMastered: number
  storiesCompleted: number
  storiesUnlocked: number
  practiceTonight: NextForYou
  programClaim: string
  hubHref: string
  balloonsHref: string
  blendHref: string
  segmentHref: string
  storyHref: string
  sightHref: string
  rhymeHref: string
  sayItHref: string
  blendsHref: string
}

export async function getEcoPenguinParentProgress(
  userId: string,
  scope?: LearnerScope
): Promise<EcoPenguinParentProgress> {
  const [balloons, stickers, blend, segment, stories, sight, rhyme, sayIt, consonant] =
    await Promise.all([
      getBalloonLettersMastery(userId, scope),
      getEcoPenguinStickers(userId, scope),
      getBlendWordMastery(userId, scope),
      getSegmentWordMastery(userId, scope),
      getReadStoryMastery(userId, scope),
      getSightWordsMastery(userId, scope),
      getNurseryRhymeMastery(userId, scope),
      getSayItMastery(userId, scope),
      getConsonantBlendsMastery(userId, scope),
    ])

  const sightWords = await getSightWords()
  const progress = computePhonicsProgress(balloons.masteredKeys)
  const earned = new Set(stickers.earnedIds)
  const unlockedStories = await getUnlockedStories(balloons.masteredKeys)

  const signals: LearningPathSignals = {
    nurseryRhymeMastered: rhyme.masteredKeys.length,
    sayItMastered: sayIt.masteredKeys.length,
    sightWordsMastered: sight.masteredKeys.length,
    sightWordsTotal: sightWords.length,
    consonantBlendsMastered: consonant.masteredKeys.length,
    storiesCompleted: stories.completedIds.length,
    storiesUnlocked: unlockedStories.length,
    blendMastered: blend.masteredKeys.length,
    segmentMastered: segment.masteredKeys.length,
  }

  const practiceTonight = recommendNextRoom(
    balloons.masteredKeys,
    stickers.earnedIds,
    signals
  )

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
    sightMastered: sight.masteredKeys.length,
    sightTotal: sightWords.length,
    nurseryRhymeMastered: rhyme.masteredKeys.length,
    sayItMastered: sayIt.masteredKeys.length,
    consonantBlendsMastered: consonant.masteredKeys.length,
    storiesCompleted: stories.completedIds.length,
    storiesUnlocked: unlockedStories.length,
    practiceTonight,
    programClaim: ECO_PENGUIN_PROGRAM.claim,
    hubHref: LEARNING_HUB_PATH,
    balloonsHref: BALLOON_LETTERS_BASE_PATH,
    blendHref: BLEND_WORD_BASE_PATH,
    segmentHref: SEGMENT_WORD_BASE_PATH,
    storyHref: READ_STORY_BASE_PATH,
    sightHref: SIGHT_WORDS_BASE_PATH,
    rhymeHref: NURSERY_RHYME_BASE_PATH,
    sayItHref: SAY_IT_BASE_PATH,
    blendsHref: CONSONANT_BLENDS_BASE_PATH,
  }
}
