/**
 * Shared session cookie options for monalo.school + subdomains.
 */
export function getAuthCookieDomain(): string | undefined {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    ''

  if (base.includes('monalo.school')) {
    return '.monalo.school'
  }

  // Local dev: host-only cookies (gallery.localhost, localhost, etc.)
  return undefined
}

export function buildSessionCookieOptions() {
  const domain = getAuthCookieDomain()
  const secure = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure,
    ...(domain ? { domain } : {}),
  }
}
