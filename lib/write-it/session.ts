export const WRITE_IT_SESSION_KEY = 'write-it:session'

export type WriteItSession = {
  mode: 'sentence' | 'trace'
  itemId: string
  label: string
  updatedAt: number
}

export function readWriteItSession(): WriteItSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(WRITE_IT_SESSION_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as WriteItSession
    if (!p?.itemId || !p.label || (p.mode !== 'sentence' && p.mode !== 'trace')) return null
    return {
      mode: p.mode,
      itemId: p.itemId,
      label: p.label,
      updatedAt: Number(p.updatedAt) || Date.now(),
    }
  } catch {
    return null
  }
}

export function writeWriteItSession(input: Omit<WriteItSession, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      WRITE_IT_SESSION_KEY,
      JSON.stringify({ ...input, updatedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}
