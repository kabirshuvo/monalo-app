import { ECO_PENGUIN_R2_PREFIX } from '@/lib/ecopenguin/constants'
import { isR2Configured, r2PublicBaseUrl } from '@/lib/storage/r2'

/** Local static folder when R2 is not configured. */
export const ECO_PENGUIN_LOCAL_MEDIA_PREFIX = '/ecopenguin'

/**
 * Base URL for Eco Penguin media (no trailing slash).
 * - R2 public custom domain: https://media.monalo.school/eco-penguine
 * - Private R2 bucket: https://app.example.com/api/media/eco-penguine
 * - Local dev: /ecopenguin
 */
export function getEcoPenguinMediaOrigin(): string {
  const publicBase = r2PublicBaseUrl()
  if (publicBase) {
    return `${publicBase}/${ECO_PENGUIN_R2_PREFIX}`
  }

  if (isR2Configured()) {
    const app =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
      ''
    return `${app}/api/media/${ECO_PENGUIN_R2_PREFIX}`
  }

  return ECO_PENGUIN_LOCAL_MEDIA_PREFIX
}

/** True when assets are served from R2 (public URL or /api/media proxy). */
export function isEcoPenguinMediaOnR2(): boolean {
  return getEcoPenguinMediaOrigin() !== ECO_PENGUIN_LOCAL_MEDIA_PREFIX
}
