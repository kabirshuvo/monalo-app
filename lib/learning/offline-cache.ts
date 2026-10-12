/**
 * Client helpers to precache Eco Penguin media for low-bandwidth / offline play.
 */

const CACHE_NAME = 'eco-penguin-media-v1'

export const OFFLINE_MEDIA_PREFIXES = [
  '/consonant-blends/',
  '/nursery-rhyme/',
  '/say-it/',
  '/sight-words/',
  '/write-it/',
  '/letter-sounds/',
  '/vowel-words/',
  '/digraphs/',
  '/ecopenguin/',
  '/balloon-letters/',
  '/eco-guide/',
] as const

export function isOfflineMediaUrl(url: string): boolean {
  try {
    const path = url.startsWith('http') ? new URL(url).pathname : url
    return OFFLINE_MEDIA_PREFIXES.some((p) => path.startsWith(p))
  } catch {
    return false
  }
}

/** Precache a list of same-origin URLs into Cache Storage (best-effort). */
export async function precacheMediaUrls(urls: string[]): Promise<number> {
  if (typeof window === 'undefined' || !('caches' in window)) return 0
  const unique = [...new Set(urls.filter(Boolean).filter(isOfflineMediaUrl))]
  if (unique.length === 0) return 0
  try {
    const cache = await caches.open(CACHE_NAME)
    let ok = 0
    await Promise.all(
      unique.map(async (url) => {
        try {
          const existing = await cache.match(url)
          if (existing) {
            ok++
            return
          }
          const res = await fetch(url, { credentials: 'same-origin' })
          if (res.ok) {
            await cache.put(url, res)
            ok++
          }
        } catch {
          // ignore single failures
        }
      })
    )
    return ok
  } catch {
    return 0
  }
}

export async function registerEcoPenguinServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false
  try {
    await navigator.serviceWorker.register('/eco-penguin-sw.js', { scope: '/' })
    return true
  } catch {
    return false
  }
}
