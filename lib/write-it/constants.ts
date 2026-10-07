export const WRITE_IT_BASE_PATH = '/learning/write-it'
export const WRITE_IT_MEDIA_PREFIX = '/write-it'

export type WriteItSentence = {
  id: string
  speak: string
  words: string[]
  distractors: string[]
  /** Pre-recorded clip; falls back to browser TTS. */
  audio?: string
}

export type WriteItLetter = {
  id: string
  letter: string
  speak: string
  group: string
  /** Pre-recorded clip; falls back to browser TTS. */
  audio?: string
}

export function resolveWriteItAsset(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/write-it/')) return path
  if (path.startsWith('/')) return `${WRITE_IT_MEDIA_PREFIX}${path}`
  return `${WRITE_IT_MEDIA_PREFIX}/${path}`
}
