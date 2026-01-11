import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect /dashboard routes with role-based access
  if (pathname.startsWith('/dashboard')) {
    const token = req.cookies.get('next-auth.session-token')?.value
    const jwtToken = req.headers.get('authorization')?.split(' ')[1]

    if (!token && !jwtToken) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/(auth)/login'
      return NextResponse.redirect(loginUrl)
    }

    // Extract role from request (this can be enhanced with JWT validation)
    // For now, we rely on NextAuth session management
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
}
