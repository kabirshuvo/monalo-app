export const SEGMENT_WORD_SESSION_KEY = 'segment-the-word:session'

export type SegmentWordSession = {
  wordId: string
  word: string
  updatedAt: number
}

export function readSegmentWordSession(): SegmentWordSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SEGMENT_WORD_SESSION_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as SegmentWordSession
    if (!p?.wordId || !p.word) return null
    return { wordId: p.wordId, word: p.word, updatedAt: Number(p.updatedAt) || Date.now() }
  } catch {
    return null
  }
}

export function writeSegmentWordSession(input: Omit<SegmentWordSession, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      SEGMENT_WORD_SESSION_KEY,
      JSON.stringify({ ...input, updatedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}
