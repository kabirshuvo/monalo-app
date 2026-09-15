/** Client session + round-deck helpers for Vowel Words. */

export const VOWEL_WORDS_SESSION_KEY = 'vowel-words:session'
export const VOWEL_WORDS_MUTE_KEY = 'vowel-words:muted'
export const VOWEL_WORDS_SHOW_WORD_KEY = 'vowel-words:showWord'
const LAST_CORRECT_KEY = 'vowel-words:lastCorrect'

export type VowelWordsSession = {
  vowelId: string
  vowelLabel: string
  page: number
  mode: 'learn' | 'play'
  updatedAt: number
}

export function readVowelWordsSession(): VowelWordsSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(VOWEL_WORDS_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as VowelWordsSession
    if (!parsed?.vowelId || !parsed.vowelLabel) return null
    return {
      vowelId: parsed.vowelId,
      vowelLabel: parsed.vowelLabel,
      page: Math.max(1, Number(parsed.page) || 1),
      mode: parsed.mode === 'play' ? 'play' : 'learn',
      updatedAt: Number(parsed.updatedAt) || Date.now(),
    }
  } catch {
    return null
  }
}

export function writeVowelWordsSession(input: Omit<VowelWordsSession, 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      VOWEL_WORDS_SESSION_KEY,
      JSON.stringify({ ...input, updatedAt: Date.now() })
    )
  } catch {
    // ignore
  }
}

export function readVowelWordsMuted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(VOWEL_WORDS_MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeVowelWordsMuted(muted: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VOWEL_WORDS_MUTE_KEY, muted ? '1' : '0')
  } catch {
    // ignore
  }
}

export function readVowelWordsShowWord(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(VOWEL_WORDS_SHOW_WORD_KEY) === '1'
  } catch {
    return false
  }
}

export function writeVowelWordsShowWord(show: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VOWEL_WORDS_SHOW_WORD_KEY, show ? '1' : '0')
  } catch {
    // ignore
  }
}

function deckKey(vowelId: string, page: number): string {
  return `vowel-words:deck:${vowelId}:${page}`
}

/** null = never started; [] = round finished */
export function readRoundDeck(vowelId: string, page: number): string[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(deckKey(vowelId, page))
    if (raw === null) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    return parsed.filter((n): n is string => typeof n === 'string' && n.length > 0)
  } catch {
    return null
  }
}

export function writeRoundDeck(vowelId: string, page: number, names: string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(deckKey(vowelId, page), JSON.stringify(names))
  } catch {
    // ignore
  }
}

export function markRoundDeckFinished(vowelId: string, page: number): void {
  writeRoundDeck(vowelId, page, [])
}

export function clearRoundDeck(vowelId: string, page: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(deckKey(vowelId, page))
  } catch {
    // ignore
  }
}

export function removeNameFromRoundDeck(vowelId: string, page: number, name: string): string[] {
  const current = readRoundDeck(vowelId, page)
  if (current === null) return []
  const next = current.filter((n) => n !== name)
  writeRoundDeck(vowelId, page, next)
  return next
}

export type VowelWordsLastCorrect = {
  vowelId: string
  page: number
  word: string
}

export function readLastCorrect(): VowelWordsLastCorrect | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LAST_CORRECT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as VowelWordsLastCorrect
    if (!parsed?.vowelId || !parsed?.word) return null
    return {
      vowelId: parsed.vowelId,
      page: Math.max(1, Number(parsed.page) || 1),
      word: parsed.word,
    }
  } catch {
    return null
  }
}

export function writeLastCorrect(input: VowelWordsLastCorrect): void {
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
