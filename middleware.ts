/**
 * Next.js Middleware for Role-Based Route Protection
 * 
 * This middleware protects dashboard routes based on user roles.
 * It runs on the edge before requests reach your pages.
 * 
 * Protection Rules:
 * - /dashboard/admin → ADMIN only
 * - /dashboard/writer → WRITER or ADMIN
 * - /dashboard/learner → LEARNER
 * - /dashboard/customer → CUSTOMER
 * - Unauthenticated → redirect to /login
 * - Unauthorized (insufficient role) → redirect to /home
 * 
 * Uses next-auth/jwt for edge-compatible token reading
 */

import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import type { JWT } from 'next-auth/jwt'

/**
 * Type for the decoded JWT token
 * Extends JWT to include our custom role property
 */
interface TokenWithRole extends JWT {
  role?: string
}

/**
 * Define role requirements for each dashboard route
 */
const roleRequirements: Record<string, string[]> = {
  '/dashboard/admin': ['ADMIN'],
  '/dashboard/writer': ['WRITER', 'ADMIN'],
  '/dashboard/learner': ['LEARNER'],
  '/dashboard/customer': ['CUSTOMER'],
}

/**
 * Middleware function that runs on protected routes
 * Checks authentication and authorization before allowing access
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Get the token from cookies using NEXTAUTH_SECRET
  // This is edge-compatible and works in Vercel Edge Runtime
  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenWithRole | null

  // Extract the dashboard route segment (e.g., "admin" from "/dashboard/admin")
  const dashboardMatch = pathname.match(/^\/dashboard\/(\w+)/)
  const dashboardRoute = dashboardMatch ? `/${dashboardMatch[0]}` : null

  // Find required roles for this route
  const requiredRoles = dashboardRoute
    ? roleRequirements[dashboardRoute]
    : null

  // Route is in dashboard but not configured - deny access
  if (pathname.startsWith('/dashboard/') && !requiredRoles) {
    return NextResponse.redirect(new URL('/403', request.url))
  }

  // If no specific role requirement, allow access (shouldn't happen with current config)
  if (!requiredRoles) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token) {
    // Save the requested URL to redirect back after login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Extract user role from token
  const userRole = token.role as string | undefined

  if (!userRole) {
    // User has session but no role assigned - redirect to home
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Check if user's role is in the allowed roles for this route
  const hasRequiredRole = requiredRoles.includes(userRole)

  if (!hasRequiredRole) {
    // User is authenticated but lacks required role
    // Show 403 Forbidden page
    return NextResponse.redirect(new URL('/403', request.url))
  }

  // User is authenticated and has required role - allow access
  return NextResponse.next()
}

/**
 * Matcher configuration for the middleware
 * 
 * The matcher array defines which routes trigger the middleware.
 * Using matcher is more efficient than checking pathname in the middleware function
 * because it prevents unnecessary middleware execution on routes that don't need protection.
 * 
 * Automatically excluded (by Next.js default):
 * - Static files: /public/* (images, css, js, etc)
 * - API routes: /api/*
 * - Next.js internals: /_next/*, /_vercel/*, etc
 * - favicon, robots.txt, sitemap.xml
 * 
 * Patterns:
 * - '/path' → Exact match
 * - '/path/:param' → Route with parameter
 * - '/path/:param*' → Route and all sub-routes (catch-all)
 * 
 * Performance Note:
 * The middleware function runs very quickly (edge runtime), but matcher ensures
 * we only execute it when necessary. This is especially important for:
 * - Static assets (CSS, images, fonts)
 * - API requests
 * - Public pages (no protection needed)
 */
export const config = {
  matcher: [
    /**
     * Protected routes requiring role-based access control
     * 
     * /dashboard/:path* matches:
     * - /dashboard/admin
     * - /dashboard/writer
     * - /dashboard/learner
     * - /dashboard/customer
     * - Any future /dashboard/* sub-routes
     */
    '/dashboard/:path*',
    
    /**
     * Future protected routes can be added here:
     * 
     * '/admin/:path*'          - Admin-only pages
     * '/api/protected/:path*'  - Protected API endpoints (if needed)
     * '/settings/:path*'       - User account settings (authentication required)
     */
  ],
}
