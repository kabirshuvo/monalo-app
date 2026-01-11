import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import { Role } from '@prisma/client'
import { logAccessDenied, logAuthFailure } from '@/lib/auth/audit-logs'

/**
 * Custom error class for authorization failures
 * Allows distinguishing between 401 (unauthorized) and 403 (forbidden)
 */
export class AuthorizationError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

/**
 * Require user to have specific role(s)
 * Use in server components or API routes to protect resources by role
 * 
 * @param allowedRoles - Single role or array of allowed roles
 * @returns Session object if user is authorized
 * @throws AuthorizationError with 401 if no session (unauthorized)
 * @throws AuthorizationError with 403 if role not allowed (forbidden)
 * 
 * @example
 * // In API route - single role
 * const session = await requireRole('ADMIN')
 * 
 * @example
 * // In API route - multiple roles
 * const session = await requireRole(['ADMIN', 'WRITER'])
 * 
 * @example
 * // In server component
 * const session = await requireRole('LEARNER')
 * const userId = (session.user as any).id
 */
export async function requireRole(
  allowedRoles: Role | Role[]
) {
  // Get the session
  const session = await getServerSession(authConfig)

  // Check if user is authenticated
  if (!session || !session.user) {
    // Log authentication failure (non-blocking)
    logAuthFailure({
      userId: 'ANONYMOUS',
      route: 'api',
      reason: 'No session found in requireRole',
    }).catch(err => console.error('Failed to log auth failure:', err))
    
    throw new AuthorizationError(
      401,
      'Unauthorized: No session found. Please sign in.'
    )
  }

  // Get user role and ID from session
  const userRole = (session.user as any)?.role
  const userId = (session.user as any)?.id

  // Normalize allowedRoles to array for easier checking
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  // Check if user has required role
  if (!rolesArray.includes(userRole)) {
    // Log insufficient role (non-blocking)
    logAccessDenied({
      userId: userId || 'UNKNOWN',
      userRole,
      route: 'api',
      reason: `Insufficient role: ${userRole} is not in [${rolesArray.join(', ')}]`,
    }).catch(err => console.error('Failed to log access denial:', err))
    
    throw new AuthorizationError(
      403,
      `Forbidden: Your role (${userRole}) does not have access to this resource. ` +
      `Required roles: ${rolesArray.join(', ')}.`
    )
  }

  // User is authorized - return session
  return session
}

/**
 * Check if user has a specific role (returns boolean instead of throwing)
 * Use when you want to handle authorization gracefully
 * 
 * @param allowedRoles - Single role or array of allowed roles
 * @returns true if user has required role, false otherwise
 * 
 * @example
 * const isAdmin = await hasRole('ADMIN')
 * if (!isAdmin) {
 *   return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
 * }
 */
export async function hasRole(allowedRoles: Role | Role[]): Promise<boolean> {
  try {
    await requireRole(allowedRoles)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get current user's role (returns null if not authenticated)
 * 
 * @returns User's role or null if not authenticated
 * 
 * @example
 * const role = await getCurrentRole()
 * if (role === 'ADMIN') {
 *   // Show admin features
 * }
 */
export async function getCurrentRole(): Promise<Role | null> {
  try {
    const session = await getServerSession(authConfig)
    return (session?.user as any)?.role || null
  } catch {
    return null
  }
}

/**
 * Get current user's ID (returns null if not authenticated)
 * 
 * @returns User's ID or null if not authenticated
 * 
 * @example
 * const userId = await getCurrentUserId()
 * if (userId) {
 *   const user = await prisma.user.findUnique({ where: { id: userId } })
 * }
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authConfig)
    return (session?.user as any)?.id || null
  } catch {
    return null
  }
}

/**
 * Get current session (returns null if not authenticated)
 * Lower-level function than requireRole (doesn't throw)
 * 
 * @returns Full session object or null if not authenticated
 * 
 * @example
 * const session = await getCurrentSession()
 * if (session) {
 *   const userId = (session.user as any).id
 * }
 */
export async function getCurrentSession() {
  try {
    return await getServerSession(authConfig)
  } catch {
    return null
  }
}

/**
 * Higher-order function to wrap API route handlers with role protection
 * Returns handler that checks role before executing
 * 
 * @param allowedRoles - Single role or array of allowed roles
 * @param handler - API route handler function
 * @returns Wrapped handler that checks authorization
 * 
 * @example
 * export const POST = withRole('ADMIN', async (request) => {
 *   // Only admins can reach here
 *   return NextResponse.json({ success: true })
 * })
 */
export function withRole(
  allowedRoles: Role | Role[],
  handler: (request: Request) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    try {
      // Verify user has required role
      await requireRole(allowedRoles)

      // Call the protected handler
      return await handler(request)
    } catch (error) {
      // Handle authorization errors
      if (error instanceof AuthorizationError) {
        return new Response(
          JSON.stringify({
            error: error.message,
          }),
          {
            status: error.statusCode,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Handle unexpected errors
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }
}

/**
 * Role permission matrix for fine-grained access control
 * Use this to define what each role can do
 */
export const rolePermissions: Record<Role, string[]> = {
  ADMIN: [
    'manage:users',
    'manage:products',
    'manage:courses',
    'manage:orders',
    'manage:blog',
    'view:analytics',
    'manage:settings',
  ],
  CUSTOMER: [
    'view:products',
    'purchase:products',
    'view:orders',
    'view:courses',
    'view:blog',
  ],
  LEARNER: [
    'view:courses',
    'view:lessons',
    'track:progress',
    'view:blog',
  ],
  WRITER: [
    'create:blog',
    'edit:blog',
    'view:blog',
    'view:courses',
  ],
}

/**
 * Check if a role has a specific permission
 * 
 * @param role - User's role
 * @param permission - Permission to check
 * @returns true if role has permission
 * 
 * @example
 * if (hasPermission('ADMIN', 'manage:users')) {
 *   // User can manage users
 * }
 */
export function hasPermission(role: Role, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

/**
 * Assert that user has a specific permission
 * Throws error if permission not granted
 * 
 * @param role - User's role
 * @param permission - Permission to check
 * @throws AuthorizationError if permission denied
 */
export function requirePermission(role: Role, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new AuthorizationError(
      403,
      `Forbidden: Your role (${role}) does not have permission: ${permission}`
    )
  }
}
