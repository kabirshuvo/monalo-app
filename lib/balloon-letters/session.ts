export const BALLOON_LETTERS_SESSION_KEY = 'balloon-letters:session'

export type BalloonLettersSession = {
  letterId: string
  letter: string
}

export function readBalloonLettersSession(): BalloonLettersSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(BALLOON_LETTERS_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BalloonLettersSession
    if (!parsed.letterId || !parsed.letter) return null
    return parsed
  } catch {
    return null
  }
}

export function writeBalloonLettersSession(session: BalloonLettersSession): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BALLOON_LETTERS_SESSION_KEY, JSON.stringify(session))
}
