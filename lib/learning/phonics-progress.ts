import { LETTER_SOUND_GROUPS } from '@/lib/letter-sounds/constants'

/** Letter ids per phonics group — same order as Letter sounds. */
export const PHONICS_GROUP_LETTER_IDS: Record<(typeof LETTER_SOUND_GROUPS)[number]['id'], readonly string[]> =
  {
    satpin: ['s', 'a', 't', 'p', 'i', 'n'],
    mdgock: ['m', 'd', 'g', 'o', 'c', 'k'],
    eurhbf: ['e', 'u', 'r', 'h', 'b', 'f'],
    rest: ['l', 'j', 'v', 'w', 'x', 'y', 'z', 'q'],
  }

export type PhonicsGroupId = (typeof LETTER_SOUND_GROUPS)[number]['id']

export type PhonicsSticker = {
  groupId: PhonicsGroupId
  id: string
  label: string
  emoji: string
  referenceId: string
}

/** One sticker gift per completed balloon group. */
export const PHONICS_STICKERS: readonly PhonicsSticker[] = [
  {
    groupId: 'satpin',
    id: 'satpin',
    label: 'SATPIN star',
    emoji: '⭐',
    referenceId: 'sticker:satpin',
  },
  {
    groupId: 'mdgock',
    id: 'mdgock',
    label: 'MDGOCK moon',
    emoji: '🌙',
    referenceId: 'sticker:mdgock',
  },
  {
    groupId: 'eurhbf',
    id: 'eurhbf',
    label: 'EURHBF sun',
    emoji: '☀️',
    referenceId: 'sticker:eurhbf',
  },
  {
    groupId: 'rest',
    id: 'rest',
    label: 'Alphabet crown',
    emoji: '👑',
    referenceId: 'sticker:rest',
  },
] as const

export type PhonicsProgress = {
  unlockedGroupIds: PhonicsGroupId[]
  completedGroupIds: PhonicsGroupId[]
  activeGroupId: PhonicsGroupId
  nextGroupId: PhonicsGroupId | null
}

export function isPhonicsGroupId(id: string): id is PhonicsGroupId {
  return LETTER_SOUND_GROUPS.some((group) => group.id === id)
}

export function getStickerForGroup(groupId: PhonicsGroupId): PhonicsSticker | undefined {
  return PHONICS_STICKERS.find((sticker) => sticker.groupId === groupId)
}

export function isGroupComplete(
  groupId: PhonicsGroupId,
  masteredLetterIds: Iterable<string>
): boolean {
  const mastered = masteredLetterIds instanceof Set ? masteredLetterIds : new Set(masteredLetterIds)
  const letters = PHONICS_GROUP_LETTER_IDS[groupId]
  return letters.every((id) => mastered.has(id))
}

/**
 * Unlock rule: satpin always open; group N opens when every letter in group N−1
 * has balloon-letters mastery.
 */
export function computePhonicsProgress(masteredLetterIds: Iterable<string>): PhonicsProgress {
  const mastered = masteredLetterIds instanceof Set ? masteredLetterIds : new Set(masteredLetterIds)
  const unlockedGroupIds: PhonicsGroupId[] = []
  const completedGroupIds: PhonicsGroupId[] = []

  for (let i = 0; i < LETTER_SOUND_GROUPS.length; i++) {
    const group = LETTER_SOUND_GROUPS[i]
    const groupId = group.id
    if (i === 0) {
      unlockedGroupIds.push(groupId)
    } else {
      const prevId = LETTER_SOUND_GROUPS[i - 1].id
      if (isGroupComplete(prevId, mastered)) {
        unlockedGroupIds.push(groupId)
      } else {
        break
      }
    }
    if (isGroupComplete(groupId, mastered)) {
      completedGroupIds.push(groupId)
    }
  }

  const activeGroupId =
    unlockedGroupIds.find((id) => !completedGroupIds.includes(id)) ??
    unlockedGroupIds[unlockedGroupIds.length - 1] ??
    'satpin'

  const nextIncomplete = unlockedGroupIds.find(
    (id) => !completedGroupIds.includes(id) && id !== activeGroupId
  )

  return {
    unlockedGroupIds,
    completedGroupIds,
    activeGroupId,
    nextGroupId: nextIncomplete ?? null,
  }
}

export function groupLabel(groupId: PhonicsGroupId): string {
  return LETTER_SOUND_GROUPS.find((group) => group.id === groupId)?.label ?? groupId
}
