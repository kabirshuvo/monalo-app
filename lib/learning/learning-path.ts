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
import { WHICH_SOUND_BASE_PATH } from '@/lib/which-sound/constants'
import { SEGMENT_WORD_BASE_PATH } from '@/lib/segment-the-word/constants'
import { READ_STORY_BASE_PATH } from '@/lib/read-a-story/constants'
import type { LearningGameId } from '@/lib/learning/kids-hub'

/** Soft path order shown on the hub. */
export const LEARNING_PATH_STEPS: { id: LearningGameId; step: number; label: string }[] = [
  { id: 'letter-sounds', step: 1, label: 'Sounds' },
  { id: 'which-sound', step: 2, label: 'Which?' },
  { id: 'balloon-letters', step: 3, label: 'Balloons' },
  { id: 'blend-the-word', step: 4, label: 'Blend' },
  { id: 'segment-the-word', step: 5, label: 'Segment' },
  { id: 'ecopenguin', step: 6, label: 'Explore' },
  { id: 'vowel-words', step: 7, label: 'Vowels' },
  { id: 'digraphs', step: 8, label: 'Teams' },
  { id: 'build-the-word', step: 9, label: 'Spell' },
  { id: 'read-a-story', step: 10, label: 'Story' },
]

export type NextForYou = {
  id: LearningGameId
  title: string
  detail: string
  href: string
}

export function unlockedLetterIds(progress: PhonicsProgress): Set<string> {
  const ids = new Set<string>()
  for (const groupId of progress.unlockedGroupIds) {
    for (const letter of PHONICS_GROUP_LETTER_IDS[groupId as PhonicsGroupId]) {
      ids.add(letter)
    }
  }
  return ids
}

/** Letters from sticker-completed balloon groups only (packs open after the gift). */
export function completedLetterIds(progress: PhonicsProgress): Set<string> {
  const ids = new Set<string>()
  for (const groupId of progress.completedGroupIds) {
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

export function recommendNextRoom(
  masteredBalloonKeys: string[],
  earnedStickerIds: string[]
): NextForYou {
  const progress = computePhonicsProgress(masteredBalloonKeys)
  const hasStartedBalloons = masteredBalloonKeys.length > 0
  const completed = progress.completedGroupIds.length
  const allGroupsDone =
    completed >= Object.keys(PHONICS_GROUP_LETTER_IDS).length

  if (!hasStartedBalloons) {
    return {
      id: 'letter-sounds',
      title: 'Letter sounds',
      detail: 'Start here — then try Which sound? before balloons.',
      href: LETTER_SOUNDS_BASE_PATH,
    }
  }

  if (!progress.completedGroupIds.includes('satpin')) {
    return {
      id: 'balloon-letters',
      title: 'Balloon letters',
      detail: 'Catch SATPIN balloons to earn your first sticker.',
      href: BALLOON_LETTERS_BASE_PATH,
    }
  }

  if (completed === 1) {
    return {
      id: 'blend-the-word',
      title: 'Blend the word',
      detail: 'SATPIN star earned — blend packs are open.',
      href: BLEND_WORD_BASE_PATH,
    }
  }

  if (completed === 2) {
    return {
      id: 'segment-the-word',
      title: 'Segment the word',
      detail: 'Hear the whole word, then tap each sound.',
      href: SEGMENT_WORD_BASE_PATH,
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

  if (earnedStickerIds.length > 0) {
    return {
      id: 'read-a-story',
      title: 'Read a story',
      detail: 'You know the letters — read a short decodable story.',
      href: READ_STORY_BASE_PATH,
    }
  }

  return {
    id: 'which-sound',
    title: 'Which sound?',
    detail: 'Hear a sound, then tap the matching picture.',
    href: WHICH_SOUND_BASE_PATH,
  }
}

export const LEARNING_PATH_EXTRA_HREFS = {
  whichSound: WHICH_SOUND_BASE_PATH,
  segment: SEGMENT_WORD_BASE_PATH,
  explore: ECO_PENGUIN_BASE_PATH,
  vowels: VOWEL_WORDS_BASE_PATH,
  digraphs: DIGRAPHS_BASE_PATH,
  build: BUILD_WORD_BASE_PATH,
  story: READ_STORY_BASE_PATH,
} as const
