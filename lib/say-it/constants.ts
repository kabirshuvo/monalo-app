export const SAY_IT_BASE_PATH = '/learning/say-it'
export const SAY_IT_MEDIA_PREFIX = '/say-it'

export type SayItPrompt = {
  id: string
  label: string
  speak: string
  kind: 'word' | 'phrase'
  /** Optional vowel-words-relative image path */
  image: string | null
  /** Pre-recorded clip; falls back to browser TTS. */
  audio?: string
}

export function resolveSayItAsset(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/say-it/') || path.startsWith('/vowel-words/')) return path
  if (path.startsWith('/')) return `${SAY_IT_MEDIA_PREFIX}${path}`
  return `${SAY_IT_MEDIA_PREFIX}/${path}`
}
