export const SIGHT_WORDS_SESSION_KEY = 'sight-words:session'

export type SightWordsSession = {
  wordId: string
  word: string
  updatedAt: number
}

export function readSightWordsSession(): SightWordsSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SIGHT_WORDS_SESSION_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as SightWordsSession
    if (!p?.wordId || !p.word) return null
    return { wordId: p.wordId, word: p.word, updatedAt: Number(p.updatedAt) || Date.now() }
  } catch {
    return null
  }
}

export function writeSightWordsSession(input: Omit<SightWordsSession, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      SIGHT_WORDS_SESSION_KEY,
      JSON.stringify({ ...input, updatedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}
