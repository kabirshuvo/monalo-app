export const WHICH_SOUND_SESSION_KEY = 'which-sound:session'

export type WhichSoundSession = {
  letterId: string
  letter: string
  updatedAt: number
}

export function readWhichSoundSession(): WhichSoundSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(WHICH_SOUND_SESSION_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as WhichSoundSession
    if (!p?.letterId || !p.letter) return null
    return { letterId: p.letterId, letter: p.letter, updatedAt: Number(p.updatedAt) || Date.now() }
  } catch {
    return null
  }
}

export function writeWhichSoundSession(input: Omit<WhichSoundSession, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      WHICH_SOUND_SESSION_KEY,
      JSON.stringify({ ...input, updatedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}
