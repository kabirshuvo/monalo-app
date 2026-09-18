import { BALLOON_LETTERS_BASE_PATH } from '@/lib/balloon-letters/constants'
import { BLEND_WORD_BASE_PATH } from '@/lib/blend-the-word/constants'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'
import { BUILD_WORD_BASE_PATH } from '@/lib/build-word/session'
import {
  computePhonicsProgress,
  PHONICS_GROUP_LETTER_IDS,
  type PhonicsGroupId,
  type PhonicsProgress,
} from '@/lib/learning/phonics-progress'
import { LETTER_SOUNDS_BASE_PATH } from '@/lib/letter-sounds/constants'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'
import type { LearningGameId } from '@/lib/learning/kids-hub'

/** Soft path order shown on the hub (1–7). */
export const LEARNING_PATH_STEPS: { id: LearningGameId; step: number; label: string }[] = [
  { id: 'letter-sounds', step: 1, label: 'Sounds' },
  { id: 'balloon-letters', step: 2, label: 'Balloons' },
  { id: 'blend-the-word', step: 3, label: 'Blend' },
  { id: 'ecopenguin', step: 4, label: 'Explore' },
  { id: 'vowel-words', step: 5, label: 'Vowels' },
  { id: 'digraphs', step: 6, label: 'Teams' },
  { id: 'build-the-word', step: 7, label: 'Spell' },
]

export type NextForYou = {
  id: LearningGameId
  title: string
  detail: string
  href: string
}

/** Letters the learner may use in Blend (all letters from unlocked balloon groups). */
export function unlockedLetterIds(progress: PhonicsProgress): Set<string> {
  const ids = new Set<string>()
  for (const groupId of progress.unlockedGroupIds) {
    for (const letter of PHONICS_GROUP_LETTER_IDS[groupId as PhonicsGroupId]) {
      ids.add(letter)
    }
  }
  return ids
}

export function wordFitsUnlockedLetters(
  graphemes: string[],
  unlocked: Set<string>
): boolean {
  return graphemes.every((g) => unlocked.has(g.toLowerCase()))
}

/**
 * Recommend the next room on the Sounds → Balloons → Blend → … spine.
 */
export function recommendNextRoom(
  masteredBalloonKeys: string[],
  earnedStickerIds: string[]
): NextForYou {
  const progress = computePhonicsProgress(masteredBalloonKeys)
  const hasStartedBalloons = masteredBalloonKeys.length > 0
  const allGroupsDone =
    progress.completedGroupIds.length >= Object.keys(PHONICS_GROUP_LETTER_IDS).length
  const stickerCount = new Set(earnedStickerIds).size

  if (!hasStartedBalloons) {
    return {
      id: 'letter-sounds',
      title: 'Letter sounds',
      detail: 'Start here — hear each letter, then catch balloons.',
      href: LETTER_SOUNDS_BASE_PATH,
    }
  }

  if (!allGroupsDone) {
    return {
      id: 'balloon-letters',
      title: 'Balloon letters',
      detail: `Keep catching · ${progress.activeGroupId} set`,
      href: BALLOON_LETTERS_BASE_PATH,
    }
  }

  if (stickerCount > 0) {
    return {
      id: 'blend-the-word',
      title: 'Blend the word',
      detail: 'You earned stickers — blend sounds into words.',
      href: BLEND_WORD_BASE_PATH,
    }
  }

  return {
    id: 'blend-the-word',
    title: 'Blend the word',
    detail: 'Hear the sounds, then tap the picture.',
    href: BLEND_WORD_BASE_PATH,
  }
}

export const LEARNING_PATH_EXTRA_HREFS = {
  explore: ECO_PENGUIN_BASE_PATH,
  vowels: VOWEL_WORDS_BASE_PATH,
  digraphs: DIGRAPHS_BASE_PATH,
  build: BUILD_WORD_BASE_PATH,
} as const
