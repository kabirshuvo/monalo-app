export const BLEND_WORD_SESSION_KEY = 'blend-word:session'

export type BlendWordSession = {
  wordId: string
  word: string
}

export function readBlendWordSession(): BlendWordSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(BLEND_WORD_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BlendWordSession
    if (!parsed.wordId || !parsed.word) return null
    return parsed
  } catch {
    return null
  }
}

export function writeBlendWordSession(session: BlendWordSession): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BLEND_WORD_SESSION_KEY, JSON.stringify(session))
}
