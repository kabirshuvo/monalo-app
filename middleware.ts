/**
 * Middleware: subdomain routing + Auth.js v5 JWT session protection.
 * Uses edge-safe auth.config only (no Prisma in middleware bundle).
 */

import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import authConfig from '@/auth.config'
import { handleSiteRouting } from '@/lib/sites'
import { isGuestTryPath } from '@/lib/learning/guest-try'

const { auth } = NextAuth(authConfig)

export default auth((request) => {
  const pathname = request.nextUrl.pathname

  const needsAuth =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/classroom') ||
    pathname === '/profile' ||
    pathname === '/settings' ||
    ((pathname === '/learning' || pathname.startsWith('/learning/')) && !isGuestTryPath(pathname))

  if (needsAuth && !request.auth?.user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
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
