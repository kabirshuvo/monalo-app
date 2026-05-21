/**
 * Middleware: surface subdomain routing + dashboard authentication.
 */

import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import type { JWT } from 'next-auth/jwt'
import { handleSiteRouting } from '@/lib/sites'

interface AuthToken extends JWT {
  sub?: string
}

async function requireAuth(request: NextRequest, pathname: string) {
  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })) as AuthToken | null

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return null
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/dashboard')) {
    const authRedirect = await requireAuth(request, pathname)
    if (authRedirect) return authRedirect
    return NextResponse.next()
  }

  const siteResponse = handleSiteRouting(request)
  if (siteResponse) return siteResponse

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api/media|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
