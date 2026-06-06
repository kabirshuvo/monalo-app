import type { NextResponse } from 'next/server'
import authConfig from '@/auth.config'
import { getAuthCookieDomain } from '@/lib/auth/cookies'

/** Legacy NextAuth v4 cookie names that may still exist in browsers. */
const LEGACY_SESSION_COOKIE_NAMES = [
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
] as const

function sessionCookieName(): string {
  const configured = authConfig.cookies?.sessionToken?.name
  if (typeof configured === 'string') return configured
  return process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'
}

function expireCookie(
  response: NextResponse,
  name: string,
  options: { httpOnly: boolean; domain?: string }
): void {
  const secure = process.env.NODE_ENV === 'production'
  const base = {
    maxAge: 0,
    path: '/',
    secure,
    sameSite: 'lax' as const,
    httpOnly: options.httpOnly,
  }

  response.cookies.set(name, '', base)
  if (options.domain) {
    response.cookies.set(name, '', { ...base, domain: options.domain })
  }
}

function resolveCookieDomain(domainOverride?: string): string | undefined {
  return domainOverride ?? getAuthCookieDomain()
}

/** Expire session + auth helper cookies on a NextResponse (host-only and domain variants). */
export function clearSessionCookiesOnResponse(
  response: NextResponse,
  domainOverride?: string
): void {
  const domain = resolveCookieDomain(domainOverride)
  const sessionName = sessionCookieName()

  const cookieDefs: { name: string; httpOnly: boolean }[] = [
    { name: sessionName, httpOnly: true },
    ...LEGACY_SESSION_COOKIE_NAMES.map((name) => ({ name, httpOnly: true })),
    {
      name:
        authConfig.cookies?.callbackUrl?.name ??
        (process.env.NODE_ENV === 'production'
          ? '__Secure-authjs.callback-url'
          : 'authjs.callback-url'),
      httpOnly: false,
    },
    {
      name:
        authConfig.cookies?.csrfToken?.name ??
        (process.env.NODE_ENV === 'production'
          ? '__Host-authjs.csrf-token'
          : 'authjs.csrf-token'),
      httpOnly: true,
    },
  ]

  for (const { name, httpOnly } of cookieDefs) {
    expireCookie(response, name, { httpOnly, domain })
    expireCookie(response, name, { httpOnly })
  }
}

/** Clear chunked session cookies seen on the incoming request, then defaults. */
export function clearSessionCookiesFromStore(
  response: NextResponse,
  cookieNames: string[],
  domainOverride?: string
): void {
  const domain = resolveCookieDomain(domainOverride)
  const sessionPrefix = sessionCookieName()

  for (const name of cookieNames) {
    const isSessionChunk =
      name.startsWith(sessionPrefix) ||
      LEGACY_SESSION_COOKIE_NAMES.some((legacy) => name.startsWith(legacy))
    if (!isSessionChunk) continue
    expireCookie(response, name, { httpOnly: true, domain })
    expireCookie(response, name, { httpOnly: true })
  }

  clearSessionCookiesOnResponse(response, domainOverride)
}

export function cookieDomainFromHost(hostname: string): string | undefined {
  const host = hostname.toLowerCase()
  if (host === 'monalo.school' || host.endsWith('.monalo.school')) {
    return '.monalo.school'
  }
  return getAuthCookieDomain()
}
