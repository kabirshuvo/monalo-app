export const CONSONANT_BLENDS_BASE_PATH = '/learning/consonant-blends'
export const CONSONANT_BLENDS_LOCAL_MEDIA_PREFIX = '/consonant-blends'

/** Pack 2 opens after this many pack-1 words are mastered. */
export const CONSONANT_BLENDS_PACK2_UNLOCK_HITS = 3

const SHARED_MEDIA_PREFIXES = [
  '/ecopenguin/',
  '/digraphs/',
  '/vowel-words/',
  '/letter-sounds/',
] as const

export type ConsonantBlendWord = {
  id: string
  blend: string
  word: string
  /** 1 = core set; 2 = extended (unlock after pack 1 progress) */
  pack?: 1 | 2
  graphemes: string[]
  image: string
  speak: { blend: string; word: string }
  audio: { blend: string; word: string }
}

export function resolveConsonantBlendAsset(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (SHARED_MEDIA_PREFIXES.some((prefix) => path.startsWith(prefix))) return path
  if (path.startsWith('/')) return `${CONSONANT_BLENDS_LOCAL_MEDIA_PREFIX}${path}`
  return `${CONSONANT_BLENDS_LOCAL_MEDIA_PREFIX}/${path}`
}

export function filterUnlockedBlendWords(
  words: ConsonantBlendWord[],
  masteredKeys: string[]
): ConsonantBlendWord[] {
  const mastered = new Set(masteredKeys)
  const pack1 = words.filter((w) => (w.pack ?? 1) === 1)
  const pack1Mastered = pack1.filter((w) => mastered.has(w.id)).length
  const pack2Open = pack1Mastered >= CONSONANT_BLENDS_PACK2_UNLOCK_HITS
  return words.filter((w) => (w.pack ?? 1) === 1 || pack2Open)
}
