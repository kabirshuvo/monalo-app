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

import NextAuth from 'next-auth'
import authConfig from '@/auth.config'

/**
 * NextAuth handler for server-side session fetching
 * 
 * Call this in server components to get the current session:
 *   const session = await auth()
 *   if (!session) redirect('/login')
 */
export const auth = NextAuth(authConfig)
