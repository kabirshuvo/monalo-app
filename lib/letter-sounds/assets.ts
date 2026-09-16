import { LETTER_SOUNDS_R2_PREFIX } from '@/lib/letter-sounds/constants'
import { r2PublicBaseUrl } from '@/lib/storage/r2'

export const LETTER_SOUNDS_LOCAL_MEDIA_PREFIX = '/letter-sounds'

function withPrefix(base: string): string {
  const clean = base.replace(/\/$/, '')
  return LETTER_SOUNDS_R2_PREFIX ? `${clean}/${LETTER_SOUNDS_R2_PREFIX}` : clean
}

/**
 * Prefer explicit override, then local public/ folder.
 * Only use R2 when NEXT_PUBLIC_LETTER_SOUNDS_USE_R2=1.
 */
export function getLetterSoundsMediaOrigin(): string {
  const override = process.env.NEXT_PUBLIC_LETTER_SOUNDS_MEDIA_BASE_URL?.replace(/\/$/, '')
  if (override) return withPrefix(override)

  if (process.env.NEXT_PUBLIC_LETTER_SOUNDS_USE_R2 === '1') {
    const publicBase = r2PublicBaseUrl()
    if (publicBase) return withPrefix(publicBase)
  }

  return LETTER_SOUNDS_LOCAL_MEDIA_PREFIX
}

export function resolveLetterSoundsAsset(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const origin = getLetterSoundsMediaOrigin()
  if (path.startsWith('/')) return `${origin}${path}`
  return `${origin}/${path}`
}
