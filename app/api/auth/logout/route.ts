import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import {
  clearSessionCookiesFromStore,
  clearSessionCookiesOnResponse,
  cookieDomainFromHost,
} from '@/lib/auth/clear-session-cookies'

function logoutRedirectTarget(request: NextRequest): string {
  const redirectParam = request.nextUrl.searchParams.get('redirect')
  if (redirectParam?.startsWith('/')) {
    return redirectParam.includes('signedOut')
      ? redirectParam
      : `${redirectParam}${redirectParam.includes('?') ? '&' : '?'}signedOut=1`
  }
  return '/?signedOut=1'
}

async function buildLogoutResponse(request: NextRequest, redirectTo: string) {
  const store = await cookies()
  const domain = cookieDomainFromHost(request.nextUrl.hostname)
  const target = new URL(redirectTo, request.url)
  const response = NextResponse.redirect(target)

  clearSessionCookiesFromStore(
    response,
    store.getAll().map((c) => c.name),
    domain
  )
  clearSessionCookiesOnResponse(response, domain)

  return response
}

/**
 * Full-page sign out (reliable Set-Cookie). Query: ?redirect=/
 */
export async function GET(request: NextRequest) {
  return buildLogoutResponse(request, logoutRedirectTarget(request))
}

export async function POST(request: NextRequest) {
  const redirectTo = logoutRedirectTarget(request)
  const domain = cookieDomainFromHost(request.nextUrl.hostname)

  if (request.headers.get('accept')?.includes('application/json')) {
    const store = await cookies()
    const response = NextResponse.json({ ok: true })
    clearSessionCookiesFromStore(
      response,
      store.getAll().map((c) => c.name),
      domain
    )
    clearSessionCookiesOnResponse(response, domain)
    return response
  }

  return buildLogoutResponse(request, redirectTo)
}
