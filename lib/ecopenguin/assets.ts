import { getEcoPenguinMediaOrigin } from '@/lib/ecopenguin/media-origin'

/**
 * Map legacy this-is-app paths (/images/..., /audio/...) to Eco Penguin media URLs (R2 or local).
 */
export function resolveEcoPenguinAsset(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const origin = getEcoPenguinMediaOrigin()

  if (path.startsWith('/images/') || path.startsWith('/audio/')) {
    return `${origin}${path}`
  }

  if (path.startsWith('images/') || path.startsWith('audio/')) {
    return `${origin}/${path}`
  }

  if (path.startsWith('/')) {
    return `${origin}${path}`
  }

  return `${origin}/${path}`
}
