import welcomeData from '../data/welcomeMessages.json'

export type WelcomeType = 'new' | 'returning'

// Normalize messages into two arrays: firstLoginMessages and returningMessages.
// Support two JSON shapes:
// 1) Array of objects: [{ message: string, type: 'first'|'returning' }]
// 2) Legacy shape: { newUser: string[], returningUser: string[] }
const raw: any = welcomeData as any

export const firstLoginMessages: string[] = []
export const returningMessages: string[] = []

if (Array.isArray(raw)) {
  for (const item of raw) {
    const msg = typeof item === 'string' ? item : item?.message
    const type = (item && item.type) || item?.kind || null
    if (!msg) continue
    if (type === 'first' || type === 'new' || type === 'firstLogin') {
      firstLoginMessages.push(String(msg))
    } else if (type === 'returning' || type === 'back') {
      returningMessages.push(String(msg))
    } else {
      // Unknown type: default to returning
      returningMessages.push(String(msg))
    }
  }
} else if (raw && typeof raw === 'object') {
  // Legacy keys
  if (Array.isArray(raw.newUser)) firstLoginMessages.push(...raw.newUser.filter(Boolean))
  if (Array.isArray(raw.returningUser)) returningMessages.push(...raw.returningUser.filter(Boolean))
}

// Fallback defaults
if (firstLoginMessages.length === 0) firstLoginMessages.push('Welcome to MonAlo.')
if (returningMessages.length === 0) returningMessages.push('Welcome back.')

export function getRandomWelcome(type: WelcomeType): string {
  const list = type === 'new' ? firstLoginMessages : returningMessages
  return pickRandomMessage(list)
}

// Pick a random message from an array and return its text.
// Accepts arrays of strings or objects with a `message` property.
export function pickRandomMessage(
  messages: Array<string | { message?: string }>
): string {
  if (!messages || messages.length === 0) return ''

  const max = messages.length

  // Secure randomness if available (browser)
  try {
    if (typeof window !== 'undefined' && (window.crypto as any)?.getRandomValues) {
      const arr = new Uint32Array(1)
      ;(window.crypto as any).getRandomValues(arr)
      const idx = arr[0] % max
      const item = messages[idx]
      return typeof item === 'string' ? item : String(item?.message ?? '')
    }
  } catch {
    // fallthrough to Node or Math.random
  }

  // Node.js secure randomness if available
  try {
    // Use dynamic require so bundlers don't try to include Node crypto for browser builds
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require('crypto')
    if (typeof nodeCrypto.randomInt === 'function') {
      const idx = nodeCrypto.randomInt(max)
      const item = messages[idx]
      return typeof item === 'string' ? item : String(item?.message ?? '')
    }
    const buf = nodeCrypto.randomBytes(4).readUInt32BE(0)
    const idx = buf % max
    const item = messages[idx]
    return typeof item === 'string' ? item : String(item?.message ?? '')
  } catch {
    // Last resort: Math.random
    const idx = Math.floor(Math.random() * max)
    const item = messages[idx]
    return typeof item === 'string' ? item : String(item?.message ?? '')
  }
}
