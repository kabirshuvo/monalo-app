/**
 * Middleware: subdomain routing + Auth.js v5 JWT session protection.
 * Uses edge-safe auth.config only (no Prisma in middleware bundle).
 */

import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import authConfig from '@/auth.config'
import {
  ecoPenguinCanonicalRedirect,
  getEcoPenguinOrigin,
  handleSiteRouting,
  resolveRoutedPathname,
} from '@/lib/sites'
import { isGuestTryPath } from '@/lib/learning/guest-try'

const { auth } = NextAuth(authConfig)

export default auth((request) => {
  const canonical = ecoPenguinCanonicalRedirect(request)
  if (canonical) return canonical

  // Gate on the path that will actually be served (ecopenguin.monalo.school/x → /learning/x).
  const routedPath = resolveRoutedPathname(request)

  const needsAuth =
    routedPath.startsWith('/dashboard') ||
    routedPath.startsWith('/classroom') ||
    routedPath === '/profile' ||
    routedPath === '/settings' ||
    ((routedPath === '/learning' || routedPath.startsWith('/learning/')) &&
      !isGuestTryPath(routedPath))

  if (needsAuth && !request.auth?.user) {
    const isEcoPenguin = routedPath === '/learning' || routedPath.startsWith('/learning/')
    // OAuth state cookies are host-bound and Auth.js builds callbacks from AUTH_URL,
    // so sign-in always happens on the main host; the session cookie is shared on .monalo.school.
    const mainOrigin = isEcoPenguin && getEcoPenguinOrigin() ? process.env.NEXT_PUBLIC_APP_URL : null
    const loginUrl = new URL('/login', mainOrigin || request.url)
    // Use the routed path: after sign-in on the main host, /learning/x redirects to the Eco Penguin host.
    loginUrl.searchParams.set('callbackUrl', `${routedPath}${request.nextUrl.search}`)
    if (isEcoPenguin) loginUrl.searchParams.set('from', 'ecopenguin')
    return NextResponse.redirect(loginUrl)
  }

  const siteResponse = handleSiteRouting(request)
  if (siteResponse) return siteResponse

  return NextResponse.next()
})

/**
 * Run on every page/API request except framework internals and static files.
 * Static assets are matched by extension (so new `public/<activity>/` folders need no change here).
 * Next requires the matcher to be a literal, so keep the extension list inline.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/media|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp3|wav|ogg|m4a|mp4|webm|json|js|css|txt|md|woff|woff2|map)$).*)',
  ],
}
