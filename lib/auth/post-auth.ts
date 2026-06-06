/** Where users land after sign-in / sign-up when no explicit callback is set. */
export const DEFAULT_POST_AUTH_PATH = '/'

export function sanitizeAuthCallbackUrl(
  requested: string | null | undefined,
  fallback: string = DEFAULT_POST_AUTH_PATH
): string {
  if (!requested) return fallback
  try {
    const decoded = decodeURIComponent(requested)
    if (!decoded || decoded.includes('/login') || decoded.includes('/register')) {
      return fallback
    }
    if (decoded.startsWith('http')) {
      const url = new URL(decoded)
      return `${url.pathname}${url.search}`
    }
    return decoded.startsWith('/') ? decoded : fallback
  } catch {
    return fallback
  }
}
