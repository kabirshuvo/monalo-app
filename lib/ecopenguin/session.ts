/** Client-side session helpers for Eco Penguin resume + prefs. */

export const ECO_PENGUIN_SESSION_KEY = 'ecopenguin:session'
export const ECO_PENGUIN_MUTE_KEY = 'ecopenguin:muted'
export const ECO_PENGUIN_SHOW_WORD_KEY = 'ecopenguin:showWord'

export type EcoPenguinSession = {
  categorySlug: string
  categoryName: string
  page: number
  mode: 'learn' | 'play'
  updatedAt: number
}

export function readEcoPenguinSession(): EcoPenguinSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ECO_PENGUIN_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as EcoPenguinSession
    if (!parsed?.categorySlug || !parsed.categoryName) return null
    return {
      categorySlug: parsed.categorySlug,
      categoryName: parsed.categoryName,
      page: Math.max(1, Number(parsed.page) || 1),
      mode: parsed.mode === 'play' ? 'play' : 'learn',
      updatedAt: Number(parsed.updatedAt) || Date.now(),
    }
  } catch {
    return null
  }
}

export function writeEcoPenguinSession(
  input: Omit<EcoPenguinSession, 'updatedAt'>
): void {
  if (typeof window === 'undefined') return
  try {
    const payload: EcoPenguinSession = {
      ...input,
      updatedAt: Date.now(),
    }
    window.localStorage.setItem(ECO_PENGUIN_SESSION_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

export function readEcoPenguinMuted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(ECO_PENGUIN_MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeEcoPenguinMuted(muted: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ECO_PENGUIN_MUTE_KEY, muted ? '1' : '0')
  } catch {
    // ignore
  }
}

export function readEcoPenguinShowWord(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(ECO_PENGUIN_SHOW_WORD_KEY) === '1'
  } catch {
    return false
  }
}

export function writeEcoPenguinShowWord(show: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ECO_PENGUIN_SHOW_WORD_KEY, show ? '1' : '0')
  } catch {
    // ignore
  }
}

const ECO_PENGUIN_LAST_CORRECT_KEY = 'ecopenguin:lastCorrect'

function deckStorageKey(categorySlug: string, page: number): string {
  return `ecopenguin:deck:${categorySlug}:${page}`
}

/** Remaining names to ask this round (no-repeat shuffle bag).
 *  `null` = never started; `[]` = round finished (do not auto-rebuild).
 */
export function readRoundDeck(categorySlug: string, page: number): string[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(deckStorageKey(categorySlug, page))
    if (raw === null) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    return parsed.filter((n): n is string => typeof n === 'string' && n.length > 0)
  } catch {
    return null
  }
}

/** Mark round finished without deleting the key (empty array sentinel). */
export function markRoundDeckFinished(categorySlug: string, page: number): void {
  writeRoundDeck(categorySlug, page, [])
}

export function writeRoundDeck(categorySlug: string, page: number, names: string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(deckStorageKey(categorySlug, page), JSON.stringify(names))
  } catch {
    // ignore
  }
}

export function clearRoundDeck(categorySlug: string, page: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(deckStorageKey(categorySlug, page))
  } catch {
    // ignore
  }
}

/** Remove a name from the deck (after correct / celebrate). */
export function removeNameFromRoundDeck(
  categorySlug: string,
  page: number,
  name: string
): string[] {
  const current = readRoundDeck(categorySlug, page)
  if (current === null) return []
  const next = current.filter((n) => n !== name)
  writeRoundDeck(categorySlug, page, next)
  return next
}

export type EcoPenguinLastCorrect = {
  categorySlug: string
  page: number
  name: string
}

export function readLastCorrect(): EcoPenguinLastCorrect | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ECO_PENGUIN_LAST_CORRECT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as EcoPenguinLastCorrect
    if (!parsed?.categorySlug || !parsed?.name || !parsed?.page) return null
    return {
      categorySlug: parsed.categorySlug,
      page: Math.max(1, Number(parsed.page) || 1),
      name: parsed.name,
    }
  } catch {
    return null
  }
}

export function writeLastCorrect(input: EcoPenguinLastCorrect): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ECO_PENGUIN_LAST_CORRECT_KEY, JSON.stringify(input))
  } catch {
    // ignore
  }
}

export function clearLastCorrect(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(ECO_PENGUIN_LAST_CORRECT_KEY)
  } catch {
    // ignore
  }
}
