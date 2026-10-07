export const SIGHT_WORDS_BASE_PATH = '/learning/sight-words'
export const SIGHT_WORDS_MEDIA_PREFIX = '/sight-words'

export type SightWord = {
  id: string
  word: string
  speak: string
  /** Pre-recorded clip; falls back to browser TTS. */
  audio?: string
}

export type SightSentence = {
  id: string
  sightId: string
  text: string
  speak: string
  words: string[]
  blankIndex: number
  choices: string[]
  /** Pre-recorded clip; falls back to browser TTS. */
  audio?: string
}

export function resolveSightWordsAsset(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/sight-words/')) return path
  if (path.startsWith('/')) return `${SIGHT_WORDS_MEDIA_PREFIX}${path}`
  return `${SIGHT_WORDS_MEDIA_PREFIX}/${path}`
}
