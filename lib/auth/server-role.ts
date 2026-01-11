/**
 * Server-side RBAC utilities for Next.js Server Components
 * 
 * These functions are designed for use in Server Components and app directory pages.
 * They use getServerSession() to retrieve the user session server-side.
 * 
 * Usage in pages:
 *   import { requireServerRole, getServerUserSession } from '@/lib/auth/server-role'
 *   import { redirect } from 'next/navigation'
 * 
 *   export default async function AdminPage() {
 *     await requireServerRole('ADMIN')
 *     // Rest of page only renders if authorized
 *   }
 */

import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import { redirect } from 'next/navigation'
import type { Role } from '@prisma/client'
import type { Session } from 'next-auth'
import { logAccessDenied, logAuthFailure } from '@/lib/auth/audit-logs'

/**
 * Get the current server session without throwing errors
 * Returns null if no session exists or user is not authenticated
 * Safe to use in any server component
 * 
 * Usage:
 *   const session = await getServerUserSession()
 *   if (session) {
 *     console.log('User role:', session.user.role)
 *   }
 */
export async function getServerUserSession(): Promise<Session | null> {
  return getServerSession(authConfig)
}

/**
 * Get the current user ID from server session
 * Returns null if no session or user
 * 
 * Usage:
 *   const userId = await getServerUserId()
 *   if (userId) {
 *     // User is authenticated
 *   }
 */
export async function getServerUserId(): Promise<string | null> {
  const session = await getServerUserSession()
  return (session?.user as any)?.id || null
}

/**
 * Get the current user's role from server session
 * Returns null if no session or role not found
 * 
 * Usage:
 *   const role = await getServerUserRole()
 *   if (role === 'ADMIN') {
 *     // Admin user
 *   }
 */
export async function getServerUserRole(): Promise<Role | null> {
  const session = await getServerUserSession()
  return (session?.user as any)?.role || null
}

/**
 * Check if the current user has a specific role (non-throwing variant)
 * Useful for conditional rendering or graceful fallbacks
 * 
 * Usage:
 *   const isAdmin = await hasServerRole('ADMIN')
 *   if (!isAdmin) {
 *     return <UnauthorizedView />
 *   }
 */
export async function hasServerRole(
  allowedRoles: Role | Role[]
): Promise<boolean> {
  const userRole = await getServerUserRole()
  
  if (!userRole) {
    return false
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  return roles.includes(userRole)
}

/**
 * Protect a server component by requiring a specific role
 * Automatically redirects to login if not authenticated
 * Automatically redirects to home if role is insufficient
 * 
 * Usage (will not render further if unauthorized):
 *   export default async function AdminPage() {
 *     await requireServerRole('ADMIN')
 *     return <AdminContent /> // Only renders if ADMIN
 *   }
 * 
 * Usage (multiple roles):
 *   export default async function WriterPage() {
 *     await requireServerRole(['ADMIN', 'WRITER'])
 *     return <WriterContent />
 *   }
 * 
 * @param allowedRoles - Single role or array of roles to allow
 * @throws Will redirect if unauthorized
 */
export async function requireServerRole(
  allowedRoles: Role | Role[]
): Promise<Session> {
  const session = await getServerUserSession()

  // Not authenticated - log and redirect to login
  if (!session) {
    // Log authentication failure (non-blocking)
    logAuthFailure({
      userId: 'ANONYMOUS',
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      reason: 'No active session',
    }).catch(err => console.error('Failed to log auth failure:', err))
    
    redirect('/login')
  }

  const userRole = (session.user as any)?.role
  const userId = (session.user as any)?.id

  // No role found - log and redirect to home
  if (!userRole) {
    // Log role validation failure (non-blocking)
    logAccessDenied({
      userId: userId || 'UNKNOWN',
      userRole: 'UNKNOWN',
      route: '/dashboard',
      reason: 'User role not found in session',
    }).catch(err => console.error('Failed to log access denial:', err))
    
    redirect('/home')
  }

  // Check if user has required role
  const roles = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles]

  if (!roles.includes(userRole)) {
    // Log insufficient role (non-blocking)
    logAccessDenied({
      userId,
      userRole,
      route: '/dashboard',
      reason: `Insufficient role: ${userRole} is not in [${roles.join(', ')}]`,
    }).catch(err => console.error('Failed to log access denial:', err))
    
    // Insufficient permissions - redirect to home
    redirect('/home')
  }

  return session
}

/**
 * Higher-order wrapper for protecting server components
 * Returns a wrapper function that enforces role-based access
 * 
 * Usage:
 *   const ProtectedComponent = withServerRole('ADMIN', async () => {
 *     return <AdminContent />
 *   })
 * 
 *   // In page:
 *   export default ProtectedComponent
 */
export function withServerRole(
  allowedRoles: Role | Role[],
  Component: () => Promise<React.ReactNode>
) {
  return async function ProtectedComponent() {
    await requireServerRole(allowedRoles)
    return Component()
  }
}

/**
 * Create a conditional server component that renders based on role
 * Useful for pages that have different content for different roles
 * 
 * Usage:
 *   export default async function Dashboard() {
 *     const role = await getServerUserRole()
 *     
 *     if (role === 'ADMIN') {
 *       return <AdminDashboard />
 *     } else if (role === 'LEARNER') {
 *       return <LearnerDashboard />
 *     } else {
 *       return <DefaultDashboard />
 *     }
 *   }
 */
export async function requireServerAuth(): Promise<Session> {
  const session = await getServerUserSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

/**
 * Check role and throw an error if unauthorized
 * Useful in server actions, middleware, and server-side logic
 * where redirecting is not appropriate
 * 
 * Usage in server actions:
 *   'use server'
 *   import { checkRole } from '@/lib/auth/server-role'
 * 
 *   export async function createCourse(data: any) {
 *     const session = await checkRole('ADMIN')
 *     // Process with session.user.id, etc.
 *   }
 * 
 * Usage in utilities:
 *   async function deleteUser(userId: string) {
 *     const session = await checkRole(['ADMIN', 'MODERATOR'])
 *     // Only ADMIN or MODERATOR can delete users
 *     await prisma.user.delete({ where: { id: userId } })
 *   }
 * 
 * @param allowedRoles - Single role or array of roles to allow
 * @returns Session object if authorized
 * @throws Error if not authenticated or role insufficient
 */
export async function checkRole(
  allowedRoles: Role | Role[]
): Promise<Session> {
  const session = await getServerUserSession()

  // Not authenticated
  if (!session) {
    // Log authentication failure (non-blocking)
    logAuthFailure({
      userId: 'ANONYMOUS',
      route: 'server-action',
      reason: 'No active session for server action',
    }).catch(err => console.error('Failed to log auth failure:', err))
    
    throw new Error('Unauthorized: No active session. Please log in.')
  }

  const userRole = (session.user as any)?.role
  const userId = (session.user as any)?.id

  // No role found
  if (!userRole) {
    // Log role not found (non-blocking)
    logAccessDenied({
      userId: userId || 'UNKNOWN',
      userRole: 'UNKNOWN',
      route: 'server-action',
      reason: 'User role not found in session',
    }).catch(err => console.error('Failed to log access denial:', err))
    
    throw new Error('Unauthorized: User role not found.')
  }

  // Check if user has required role
  const roles = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles]

  if (!roles.includes(userRole)) {
    // Log insufficient role (non-blocking)
    logAccessDenied({
      userId,
      userRole,
      route: 'server-action',
      reason: `Insufficient role: ${userRole} is not in [${roles.join(', ')}]`,
    }).catch(err => console.error('Failed to log access denial:', err))
    
    throw new Error(
      `Forbidden: Your role (${userRole}) does not have permission to access this resource. Required: ${roles.join(', ')}`
    )
  }

  return session
}
