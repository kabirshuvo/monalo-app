export const SAY_IT_SESSION_KEY = 'say-it:session'

export type SayItSession = {
  promptId: string
  label: string
  updatedAt: number
}

export function readSayItSession(): SayItSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SAY_IT_SESSION_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as SayItSession
    if (!p?.promptId || !p.label) return null
    return { promptId: p.promptId, label: p.label, updatedAt: Number(p.updatedAt) || Date.now() }
  } catch {
    return null
  }
}

export function writeSayItSession(input: Omit<SayItSession, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      SAY_IT_SESSION_KEY,
      JSON.stringify({ ...input, updatedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}
