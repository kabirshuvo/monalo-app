/** Guest try-mode: rooms playable without login (local progress only). */

export const GUEST_TRY_ROOM_PATHS = [
  '/learning',
  '/learning/nursery-rhyme',
  '/learning/letter-sounds',
] as const

export const GUEST_TRY_ROOMS = [
  {
    id: 'nursery-rhyme',
    title: 'Rhyme time',
    href: '/learning/nursery-rhyme',
    detail: 'Tap the pictures that rhyme — no account needed.',
  },
  {
    id: 'letter-sounds',
    title: 'Letter sounds',
    href: '/learning/letter-sounds',
    detail: 'Try SATPIN letter sounds free (S A T P I N).',
  },
] as const

const GUEST_WINS_KEY = 'ecopenguin:guest-try-wins'
const GUEST_CONVERT_SHOWN_KEY = 'ecopenguin:guest-convert-shown'
/** After this many mastered items locally, nudge sign-in. */
export const GUEST_CONVERT_AFTER_WINS = 3

export function isGuestTryPath(pathname: string): boolean {
  if (pathname === '/learning') return true
  if (pathname === '/learning/nursery-rhyme') return true
  if (pathname === '/learning/letter-sounds') return true
  if (pathname.startsWith('/learning/letter-sounds/')) return true
  return false
}

export function readGuestWins(): number {
  if (typeof window === 'undefined') return 0
  try {
    const n = Number(window.localStorage.getItem(GUEST_WINS_KEY))
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  } catch {
    return 0
  }
}

export function bumpGuestWin(): number {
  if (typeof window === 'undefined') return 0
  const next = readGuestWins() + 1
  try {
    window.localStorage.setItem(GUEST_WINS_KEY, String(next))
  } catch {
    // ignore
  }
  return next
}

export function shouldShowGuestConvert(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (window.localStorage.getItem(GUEST_CONVERT_SHOWN_KEY) === '1') return false
  } catch {
    return false
  }
  return readGuestWins() >= GUEST_CONVERT_AFTER_WINS
}

export function markGuestConvertShown(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(GUEST_CONVERT_SHOWN_KEY, '1')
  } catch {
    // ignore
  }
}
