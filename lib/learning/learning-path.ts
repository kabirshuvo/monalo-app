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
import { NURSERY_RHYME_BASE_PATH } from '@/lib/nursery-rhyme/constants'
import { SIGHT_WORDS_BASE_PATH } from '@/lib/sight-words/constants'
import { CONSONANT_BLENDS_BASE_PATH } from '@/lib/consonant-blends/constants'
import { SAY_IT_BASE_PATH } from '@/lib/say-it/constants'
import { WRITE_IT_BASE_PATH } from '@/lib/write-it/constants'
import type { LearningGameId } from '@/lib/learning/kids-hub'

/** Soft path order shown on the hub. */
export const LEARNING_PATH_STEPS: { id: LearningGameId; step: number; label: string }[] = [
  { id: 'nursery-rhyme', step: 1, label: 'Rhyme' },
  { id: 'say-it', step: 2, label: 'Say it' },
  { id: 'letter-sounds', step: 3, label: 'Sounds' },
  { id: 'which-sound', step: 4, label: 'Which?' },
  { id: 'balloon-letters', step: 5, label: 'Balloons' },
  { id: 'blend-the-word', step: 6, label: 'Blend' },
  { id: 'segment-the-word', step: 7, label: 'Segment' },
  { id: 'sight-words', step: 8, label: 'Sight' },
  { id: 'write-it', step: 9, label: 'Write' },
  { id: 'ecopenguin', step: 10, label: 'Explore' },
  { id: 'vowel-words', step: 11, label: 'Vowels' },
  { id: 'digraphs', step: 12, label: 'Teams' },
  { id: 'consonant-blends', step: 13, label: 'Blends' },
  { id: 'build-the-word', step: 14, label: 'Spell' },
  { id: 'read-a-story', step: 15, label: 'Story' },
]

export type NextForYou = {
  id: LearningGameId
  title: string
  detail: string
  href: string
}

/** Extra mastery signals for smarter recommendations. */
export type LearningPathSignals = {
  nurseryRhymeMastered?: number
  sayItMastered?: number
  sightWordsMastered?: number
  sightWordsTotal?: number
  consonantBlendsMastered?: number
  writeItMastered?: number
  storiesCompleted?: number
  storiesUnlocked?: number
  blendMastered?: number
  segmentMastered?: number
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
  earnedStickerIds: string[],
  signals: LearningPathSignals = {}
): NextForYou {
  const progress = computePhonicsProgress(masteredBalloonKeys)
  const hasStartedBalloons = masteredBalloonKeys.length > 0
  const completed = progress.completedGroupIds.length
  const allGroupsDone =
    completed >= Object.keys(PHONICS_GROUP_LETTER_IDS).length
  const rhyme = signals.nurseryRhymeMastered ?? 0
  const sayIt = signals.sayItMastered ?? 0
  const sight = signals.sightWordsMastered ?? 0
  const sightTotal = signals.sightWordsTotal ?? 40
  const blends = signals.consonantBlendsMastered ?? 0
  const writeIt = signals.writeItMastered ?? 0
  const storiesDone = signals.storiesCompleted ?? 0
  const storiesOpen = signals.storiesUnlocked ?? 0
  const blendWords = signals.blendMastered ?? 0
  const segmentWords = signals.segmentMastered ?? 0

  if (!hasStartedBalloons && rhyme < 3) {
    return {
      id: 'nursery-rhyme',
      title: 'Rhyme time',
      detail: 'Warm up listening — tap the two pictures that rhyme.',
      href: NURSERY_RHYME_BASE_PATH,
    }
  }

  if (!hasStartedBalloons && sayIt < 3) {
    return {
      id: 'say-it',
      title: 'Say it',
      detail: 'Listen, say the word out loud, then tap “I said it”.',
      href: SAY_IT_BASE_PATH,
    }
  }

  if (!hasStartedBalloons) {
    return {
      id: 'letter-sounds',
      title: 'Letter sounds',
      detail: 'Start phonics — then Which sound? before balloons.',
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

  if (completed >= 1 && sight < 5) {
    return {
      id: 'sight-words',
      title: 'Sight words',
      detail: 'Stage 1 high-frequency words — hear, tap, then read a sentence.',
      href: SIGHT_WORDS_BASE_PATH,
    }
  }

  if (completed >= 1 && sight >= 3 && writeIt < 3) {
    return {
      id: 'write-it',
      title: 'Write it',
      detail: 'Build a short sentence with tiles — or finger-trace a letter.',
      href: WRITE_IT_BASE_PATH,
    }
  }

  if (completed === 1 && blendWords < 4) {
    return {
      id: 'blend-the-word',
      title: 'Blend the word',
      detail: 'SATPIN star earned — blend packs are open.',
      href: BLEND_WORD_BASE_PATH,
    }
  }

  if (completed >= 2 && segmentWords < 4) {
    return {
      id: 'segment-the-word',
      title: 'Segment the word',
      detail: 'Hear the whole word, then tap each sound.',
      href: SEGMENT_WORD_BASE_PATH,
    }
  }

  if (completed >= 2 && blends < 3) {
    return {
      id: 'consonant-blends',
      title: 'Consonant blends',
      detail: 'Try st, fr, nd — adjacent consonants for Stage 1.',
      href: CONSONANT_BLENDS_BASE_PATH,
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

  if (storiesOpen > 0 && storiesDone < storiesOpen) {
    return {
      id: 'read-a-story',
      title: 'Read a story',
      detail: 'Use your letters and sight words in a short book.',
      href: READ_STORY_BASE_PATH,
    }
  }

  if (sight < Math.min(20, sightTotal)) {
    return {
      id: 'sight-words',
      title: 'Sight words',
      detail: `Keep going — ${sight} of ${Math.min(20, sightTotal)} Stage 1 words so far.`,
      href: SIGHT_WORDS_BASE_PATH,
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
  nurseryRhyme: NURSERY_RHYME_BASE_PATH,
  sayIt: SAY_IT_BASE_PATH,
  whichSound: WHICH_SOUND_BASE_PATH,
  segment: SEGMENT_WORD_BASE_PATH,
  sightWords: SIGHT_WORDS_BASE_PATH,
  writeIt: WRITE_IT_BASE_PATH,
  explore: ECO_PENGUIN_BASE_PATH,
  vowels: VOWEL_WORDS_BASE_PATH,
  digraphs: DIGRAPHS_BASE_PATH,
  consonantBlends: CONSONANT_BLENDS_BASE_PATH,
  build: BUILD_WORD_BASE_PATH,
  story: READ_STORY_BASE_PATH,
} as const
