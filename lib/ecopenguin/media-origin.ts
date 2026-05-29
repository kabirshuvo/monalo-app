import { ECO_PENGUIN_R2_PREFIX } from '@/lib/ecopenguin/constants'
import { isR2Configured, r2PublicBaseUrl } from '@/lib/storage/r2'

/** Local static folder when R2 is not configured. */
export const ECO_PENGUIN_LOCAL_MEDIA_PREFIX = '/ecopenguin'

/** Append the (optional) object-key prefix to a base URL, avoiding double slashes. */
function withPrefix(base: string): string {
  const clean = base.replace(/\/$/, '')
  return ECO_PENGUIN_R2_PREFIX ? `${clean}/${ECO_PENGUIN_R2_PREFIX}` : clean
}

/**
 * Base URL for Eco Penguin media (no trailing slash). Checked in order:
 * - NEXT_PUBLIC_ECO_PENGUIN_MEDIA_BASE_URL: dedicated `ecopenguin` bucket public URL
 *   (works in the browser, e.g. https://pub-xxxx.r2.dev)
 * - R2_PUBLIC_BASE_URL: generic media bucket custom domain (server only)
 * - /api/media proxy when R2 is configured without a public domain (server only)
 * - /ecopenguin local static files (dev fallback)
 */
export function getEcoPenguinMediaOrigin(): string {
  const ecoBase = process.env.NEXT_PUBLIC_ECO_PENGUIN_MEDIA_BASE_URL?.replace(/\/$/, '')
  if (ecoBase) return withPrefix(ecoBase)

  const publicBase = r2PublicBaseUrl()
  if (publicBase) return withPrefix(publicBase)

  if (isR2Configured()) {
    const app =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
      ''
    return ECO_PENGUIN_R2_PREFIX ? `${app}/api/media/${ECO_PENGUIN_R2_PREFIX}` : `${app}/api/media`
  }

  return ECO_PENGUIN_LOCAL_MEDIA_PREFIX
}

/** True when assets are served from R2 (public URL or /api/media proxy). */
export function isEcoPenguinMediaOnR2(): boolean {
  return getEcoPenguinMediaOrigin() !== ECO_PENGUIN_LOCAL_MEDIA_PREFIX
}
