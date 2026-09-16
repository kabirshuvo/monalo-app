export const LETTER_SOUNDS_BASE_PATH = '/learning/letter-sounds'
export const LETTER_SOUNDS_QUIZ_PATH = '/learning/letter-sounds/quiz'

/** Object key prefix inside the monalomedia R2 bucket (when used). */
export const LETTER_SOUNDS_R2_PREFIX = 'letter-sounds'

/** Phonics order, not A to Z. Later groups are more rows in the same room. */
export const LETTER_SOUND_IDS = [
  's', 'a', 't', 'p', 'i', 'n',
  'm', 'd', 'g', 'o', 'c', 'k',
  'e', 'u', 'r', 'h', 'b', 'f',
  'l', 'j', 'v', 'w', 'x', 'y', 'z', 'q',
] as const

export const LETTER_SOUND_GROUPS = [
  { id: 'satpin', label: 's a t p i n' },
  { id: 'mdgock', label: 'm d g o c k' },
  { id: 'eurhbf', label: 'e u r h b f' },
  { id: 'rest', label: 'l j v w x y z q' },
] as const

export type LetterSoundId = (typeof LETTER_SOUND_IDS)[number]
