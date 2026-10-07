export const CONSONANT_BLENDS_SESSION_KEY = 'consonant-blends:session'

export type ConsonantBlendsSession = {
  wordId: string
  word: string
  updatedAt: number
}

export function readConsonantBlendsSession(): ConsonantBlendsSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSONANT_BLENDS_SESSION_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as ConsonantBlendsSession
    if (!p?.wordId || !p.word) return null
    return { wordId: p.wordId, word: p.word, updatedAt: Number(p.updatedAt) || Date.now() }
  } catch {
    return null
  }
}

export function writeConsonantBlendsSession(
  input: Omit<ConsonantBlendsSession, 'updatedAt'>
): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      CONSONANT_BLENDS_SESSION_KEY,
      JSON.stringify({ ...input, updatedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}
