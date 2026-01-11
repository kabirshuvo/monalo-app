import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'

/**
 * Get current user ID from NextAuth session
 * Returns null if user is not authenticated (system action)
 */
export async function getSessionUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authConfig)
    const userId = (session?.user as any)?.id
    return userId || null
  } catch (error) {
    console.warn('[Audit] Failed to get session user:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

/**
 * Add createdBy field for create operations
 * @param data - Input data object
 * @param userId - Current user ID (from session)
 * @returns Data object with createdBy field added
 */
export function withCreatedBy<T extends Record<string, any>>(
  data: T,
  userId: string | null
): T & { createdBy?: string | null } {
  return {
    ...data,
    createdBy: userId, // null for system actions
  }
}

/**
 * Add updatedBy field for update operations
 * @param data - Input data object
 * @param userId - Current user ID (from session)
 * @returns Data object with updatedBy field added
 */
export function withUpdatedBy<T extends Record<string, any>>(
  data: T,
  userId: string | null
): T & { updatedBy?: string | null } {
  return {
    ...data,
    updatedBy: userId, // null for system actions
  }
}

/**
 * Add both createdBy and updatedBy fields
 * Useful for upsert operations
 * @param data - Input data object
 * @param userId - Current user ID (from session)
 * @returns Data object with both audit fields added
 */
export function withAuditFields<T extends Record<string, any>>(
  data: T,
  userId: string | null
): T & { createdBy?: string | null; updatedBy?: string | null } {
  return {
    ...data,
    createdBy: userId,
    updatedBy: userId,
  }
}

/**
 * Get audit fields for create operation
 * Shorthand for { createdBy: userId }
 */
export function getCreatedByField(userId: string | null): { createdBy: string | null } {
  return { createdBy: userId }
}

/**
 * Get audit fields for update operation
 * Shorthand for { updatedBy: userId }
 */
export function getUpdatedByField(userId: string | null): { updatedBy: string | null } {
  return { updatedBy: userId }
}

/**
 * Middleware-style function to extract user ID from session
 * Can be used in API route handlers
 * @returns Object with userId or null
 */
export async function getAuditContext(): Promise<{ userId: string | null }> {
  const userId = await getSessionUserId()
  return { userId }
}
