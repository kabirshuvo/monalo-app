/**
 * Middleware: subdomain routing + Auth.js v5 JWT session protection.
 * Uses edge-safe auth.config only (no Prisma in middleware bundle).
 */

import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import authConfig from '@/auth.config'
import { handleSiteRouting } from '@/lib/sites'

const { auth } = NextAuth(authConfig)

export default auth((request) => {
  const pathname = request.nextUrl.pathname

  const needsAuth =
    pathname.startsWith('/dashboard') ||
    pathname === '/profile' ||
    pathname === '/settings' ||
    pathname.startsWith('/learning/ecopenguin')

  if (needsAuth && !request.auth?.user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const siteResponse = handleSiteRouting(request)
  if (siteResponse) return siteResponse

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/learning/ecopenguin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api/media|ecopenguin|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|webp)$).*)',
  ],
}
