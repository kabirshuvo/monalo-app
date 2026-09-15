export const DIGRAPHS_SESSION_KEY = 'digraphs:session'
const LAST_CORRECT_KEY = 'digraphs:lastCorrect'
const MUTE_KEY = 'digraphs:muted'
const SHOW_WORD_KEY = 'digraphs:showWord'

export type DigraphsSession = {
  digraphId: string
  digraphLabel: string
  page: number
  mode: 'learn' | 'play'
  updatedAt: number
}

export function readDigraphsSession(): DigraphsSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(DIGRAPHS_SESSION_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as DigraphsSession
    if (!p?.digraphId || !p.digraphLabel) return null
    return {
      digraphId: p.digraphId,
      digraphLabel: p.digraphLabel,
      page: Math.max(1, Number(p.page) || 1),
      mode: p.mode === 'play' ? 'play' : 'learn',
      updatedAt: Number(p.updatedAt) || Date.now(),
    }
  } catch {
    return null
  }
}

export function writeDigraphsSession(input: Omit<DigraphsSession, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      DIGRAPHS_SESSION_KEY,
      JSON.stringify({ ...input, updatedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}

export function readDigraphsMuted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeDigraphsMuted(muted: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    // ignore
  }
}

export function readDigraphsShowWord(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(SHOW_WORD_KEY) === '1'
  } catch {
    return false
  }
}

export function writeDigraphsShowWord(show: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SHOW_WORD_KEY, show ? '1' : '0')
  } catch {
    // ignore
  }
}

function deckKey(id: string, page: number) {
  return `digraphs:deck:${id}:${page}`
}

export function readRoundDeck(id: string, page: number): string[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(deckKey(id, page))
    if (raw === null) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    return parsed.filter((n): n is string => typeof n === 'string' && n.length > 0)
  } catch {
    return null
  }
}

export function writeRoundDeck(id: string, page: number, names: string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(deckKey(id, page), JSON.stringify(names))
  } catch {
    // ignore
  }
}

export function markRoundDeckFinished(id: string, page: number): void {
  writeRoundDeck(id, page, [])
}

export function clearRoundDeck(id: string, page: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(deckKey(id, page))
  } catch {
    // ignore
  }
}

export function removeNameFromRoundDeck(id: string, page: number, name: string): string[] {
  const current = readRoundDeck(id, page)
  if (current === null) return []
  const next = current.filter((n) => n !== name)
  writeRoundDeck(id, page, next)
  return next
}

export type DigraphsLastCorrect = { digraphId: string; page: number; word: string }

export function readLastCorrect(): DigraphsLastCorrect | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LAST_CORRECT_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as DigraphsLastCorrect
    if (!p?.digraphId || !p.word) return null
    return { digraphId: p.digraphId, page: Math.max(1, Number(p.page) || 1), word: p.word }
  } catch {
    return null
  }
}

export function writeLastCorrect(input: DigraphsLastCorrect): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LAST_CORRECT_KEY, JSON.stringify(input))
  } catch {
    // ignore
  }
}

export function clearLastCorrect(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(LAST_CORRECT_KEY)
  } catch {
    // ignore
  }
}
