export const BUILD_WORD_BASE_PATH = '/learning/build-the-word'
export const BUILD_WORD_SESSION_KEY = 'build-word:session'

export type BuildWordSession = {
  vowelId: string
  vowelLabel: string
  wordSlug?: string
  updatedAt: number
}

export function readBuildWordSession(): BuildWordSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(BUILD_WORD_SESSION_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as BuildWordSession
    if (!p?.vowelId || !p.vowelLabel) return null
    return {
      vowelId: p.vowelId,
      vowelLabel: p.vowelLabel,
      wordSlug: p.wordSlug,
      updatedAt: Number(p.updatedAt) || Date.now(),
    }
  } catch {
    return null
  }
}

export function writeBuildWordSession(input: Omit<BuildWordSession, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      BUILD_WORD_SESSION_KEY,
      JSON.stringify({ ...input, updatedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}

/** Letters for the word plus up to 2 distractors, shuffled. */
export function buildLetterTiles(word: string, distractors = 2): string[] {
  const letters = word.toLowerCase().split('')
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const pool = alphabet.filter((l) => !letters.includes(l))
  const extras: string[] = []
  while (extras.length < distractors && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length)
    extras.push(pool.splice(i, 1)[0])
  }
  const tiles = [...letters, ...extras]
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }
  return tiles
}
