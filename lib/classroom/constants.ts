/** Classroom Mode — teacher device, per-kid Eco Penguin progress. */

export const CLASSROOM_BASE_PATH = '/classroom'
export const CLASSROOM_BOARD_PATH = '/classroom/board'
export const CLASSROOM_SWITCH_PATH = '/classroom/switch'
export const ACTIVE_LEARNER_COOKIE = 'eco-active-learner'

export const LEARNER_AVATARS = [
  { key: 'penguin', emoji: '🐧', label: 'Penguin' },
  { key: 'star', emoji: '⭐', label: 'Star' },
  { key: 'sun', emoji: '☀️', label: 'Sun' },
  { key: 'moon', emoji: '🌙', label: 'Moon' },
  { key: 'flower', emoji: '🌸', label: 'Flower' },
  { key: 'ball', emoji: '⚽', label: 'Ball' },
  { key: 'book', emoji: '📖', label: 'Book' },
  { key: 'fish', emoji: '🐠', label: 'Fish' },
] as const

export type LearnerAvatarKey = (typeof LEARNER_AVATARS)[number]['key']

export function avatarEmoji(key: string): string {
  return LEARNER_AVATARS.find((a) => a.key === key)?.emoji ?? '🐧'
}

/** Encode classroom mastery into PointEvent.referenceId (keeps userId+ref unique). */
export function classroomReferenceId(learnerProfileId: string, referenceId: string): string {
  return `lp:${learnerProfileId}|${referenceId}`
}

export function parseClassroomReferenceId(
  referenceId: string
): { learnerProfileId: string; referenceId: string } | null {
  if (!referenceId.startsWith('lp:')) return null
  const pipe = referenceId.indexOf('|')
  if (pipe < 0) return null
  const learnerProfileId = referenceId.slice(3, pipe)
  const inner = referenceId.slice(pipe + 1)
  if (!learnerProfileId || !inner) return null
  return { learnerProfileId, referenceId: inner }
}

export function stripClassroomReferenceId(referenceId: string): string {
  return parseClassroomReferenceId(referenceId)?.referenceId ?? referenceId
}
