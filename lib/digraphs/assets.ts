import { r2PublicBaseUrl } from '@/lib/storage/r2'

export const DIGRAPHS_LOCAL_MEDIA_PREFIX = '/digraphs'
export const DIGRAPHS_R2_PREFIX = 'digraphs'

function withPrefix(base: string): string {
  const clean = base.replace(/\/$/, '')
  return DIGRAPHS_R2_PREFIX ? `${clean}/${DIGRAPHS_R2_PREFIX}` : clean
}

/** Prefer local public/ unless NEXT_PUBLIC_DIGRAPHS_USE_R2=1. */
export function getDigraphsMediaOrigin(): string {
  const override = process.env.NEXT_PUBLIC_DIGRAPHS_MEDIA_BASE_URL?.replace(/\/$/, '')
  if (override) return withPrefix(override)

  if (process.env.NEXT_PUBLIC_DIGRAPHS_USE_R2 === '1') {
    const publicBase = r2PublicBaseUrl()
    if (publicBase) return withPrefix(publicBase)
  }

  return DIGRAPHS_LOCAL_MEDIA_PREFIX
}

export function resolveDigraphsAsset(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const origin = getDigraphsMediaOrigin()
  if (path.startsWith('/')) return `${origin}${path}`
  return `${origin}/${path}`
}
