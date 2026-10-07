export const NURSERY_RHYME_SESSION_KEY = 'nursery-rhyme:session'

export type NurseryRhymeSession = {
  setId: string
  updatedAt: number
}

export function readNurseryRhymeSession(): NurseryRhymeSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(NURSERY_RHYME_SESSION_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as NurseryRhymeSession
    if (!p?.setId) return null
    return { setId: p.setId, updatedAt: Number(p.updatedAt) || Date.now() }
  } catch {
    return null
  }
}

export function writeNurseryRhymeSession(input: Omit<NurseryRhymeSession, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      NURSERY_RHYME_SESSION_KEY,
      JSON.stringify({ ...input, updatedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}
