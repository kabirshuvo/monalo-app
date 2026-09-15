/** Items shown per page in Learn / Play. */
export const VOWEL_WORDS_PER_PAGE = 6

export const VOWEL_WORDS_BASE_PATH = '/learning/vowel-words'

/** Object key prefix inside the monalomedia R2 bucket (when used). */
export const VOWEL_WORDS_R2_PREFIX = 'vowel-words'

export const SHORT_VOWEL_IDS = ['a', 'e', 'i', 'o', 'u'] as const

export type ShortVowelId = (typeof SHORT_VOWEL_IDS)[number]
