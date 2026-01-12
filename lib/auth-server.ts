/**
 * Server-side authentication handler for use in server components
 * 
 * This module provides the `auth()` function for fetching the current
 * user's session in server components and API routes.
 * 
 * Usage:
 *   import { auth } from '@/lib/auth-server'
 *   const session = await auth()
 */

import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'

/**
 * Server-side session helper using getServerSession
 *
 * Usage in server components:
 *   const session = await auth()
 */
export async function auth() {
	return getServerSession(authConfig)
}
