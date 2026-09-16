export const LETTER_SOUNDS_SESSION_KEY = 'letter-sounds:session'

export type LetterSoundsSession = {
  letterId: string
  keyword: string
  mode?: 'learn' | 'quiz'
}

export function readLetterSoundsSession(): LetterSoundsSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LETTER_SOUNDS_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LetterSoundsSession
    if (!parsed.letterId) return null
    return parsed
  } catch {
    return null
  }
}

export function writeLetterSoundsSession(session: LetterSoundsSession): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LETTER_SOUNDS_SESSION_KEY, JSON.stringify(session))
}
