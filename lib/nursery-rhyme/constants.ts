export const NURSERY_RHYME_BASE_PATH = '/learning/nursery-rhyme'
export const NURSERY_RHYME_MEDIA_PREFIX = '/nursery-rhyme'

export type NurseryRhymeChoice = {
  id: string
  label: string
  image: string
}

export type NurseryRhymeSet = {
  id: string
  prompt: string
  speak: string
  /** Optional pre-recorded clip; falls back to browser TTS. */
  audio?: string
  matchIds: [string, string] | string[]
  choices: NurseryRhymeChoice[]
}

export function resolveNurseryRhymeAsset(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/vowel-words/') || path.startsWith('/nursery-rhyme/')) return path
  if (path.startsWith('/')) return `${NURSERY_RHYME_MEDIA_PREFIX}${path}`
  return `${NURSERY_RHYME_MEDIA_PREFIX}/${path}`
}
