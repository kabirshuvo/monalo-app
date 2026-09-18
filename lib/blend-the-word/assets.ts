import { BLEND_WORD_R2_PREFIX } from '@/lib/blend-the-word/constants'
import { r2PublicBaseUrl } from '@/lib/storage/r2'

export const BLEND_WORD_LOCAL_MEDIA_PREFIX = '/blend-the-word'

function withPrefix(base: string): string {
  const clean = base.replace(/\/$/, '')
  return BLEND_WORD_R2_PREFIX ? `${clean}/${BLEND_WORD_R2_PREFIX}` : clean
}

/**
 * Prefer explicit override, then local public/ folder.
 * Only use R2 when NEXT_PUBLIC_BLEND_WORD_USE_R2=1.
 */
export function getBlendWordMediaOrigin(): string {
  const override = process.env.NEXT_PUBLIC_BLEND_WORD_MEDIA_BASE_URL?.replace(/\/$/, '')
  if (override) return withPrefix(override)

  if (process.env.NEXT_PUBLIC_BLEND_WORD_USE_R2 === '1') {
    const publicBase = r2PublicBaseUrl()
    if (publicBase) return withPrefix(publicBase)
  }

  return BLEND_WORD_LOCAL_MEDIA_PREFIX
}

export function resolveBlendWordAsset(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const origin = getBlendWordMediaOrigin()
  if (path.startsWith('/')) return `${origin}${path}`
  return `${origin}/${path}`
}
