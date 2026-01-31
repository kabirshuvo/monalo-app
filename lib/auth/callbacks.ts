import type { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/db'

/**
 * Update user's lastLoginAt timestamp on successful sign-in
 * Only updates on initial sign-in, not on token refresh
 * Handles phone-only users by resolving by ID when possible
 * @param user - NextAuth user object
 * @param account - NextAuth account object (null for existing sessions)
 * @returns boolean - whether to allow the sign-in
 */
export async function handleSignIn(params: {
  profile?: Record<string, any>
  account?: Record<string, any> | null
  user?: any
}): Promise<boolean> {
  try {
    const { account, user } = params

    // Token refresh - skip update
    if (!account) {
      return true
    }

    // Determine userId and userEmail
    const userId = user?.id || null
    const userEmail = user?.email?.toLowerCase() || null

    // If neither userId nor userEmail, log a warning and allow sign-in
    // (authentication already succeeded, we just can't update lastLoginAt)
    if (!userId && !userEmail) {
      console.warn('[Auth] Sign-in callback: No userId or email found')
      return true
    }

    // Resolve dbUser by id when possible, otherwise by email
    let dbUser: { id: string; lastLoginAt: Date | null; email: string | null } | null = null
    
    if (userId) {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { lastLoginAt: true, id: true, email: true },
      })
    } else if (userEmail) {
      dbUser = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { lastLoginAt: true, id: true, email: true },
      })
    }

    const isFirstLogin = !dbUser?.lastLoginAt

    // Update lastLoginAt using dbUser.id if available
    if (dbUser?.id) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { lastLoginAt: new Date() },
      })

      // Attach the isFirstLogin flag to the transient `user` object so it
      // can be propagated into the JWT in the `jwt` callback.
      if (user) {
        ;(user as any).isFirstLogin = isFirstLogin
      }

      console.log(`[Auth] lastLoginAt updated for user id: ${dbUser.id} (firstLogin=${isFirstLogin})`)
    }

    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Auth] Error in signIn callback: ${message}`)
    // Allow sign-in even if lastLoginAt update fails
    // This prevents authentication from being blocked by an audit field update
    return true
  }
}

/**
 * Get NextAuth callbacks configuration
 * Handles authentication events like sign-in, session updates, etc.
 */
export function getAuthCallbacks(): NextAuthOptions['callbacks'] {
  return {
    /**
     * Called when user signs in
     * Use this to update lastLoginAt on successful authentication
     */
    async signIn({ user, account, profile }) {
      // Call our custom sign-in handler
      return handleSignIn({
        user,
        account,
        profile,
      })
    },

    /**
     * Called whenever session is checked or modified
     * Injects user role, id, and phone into the session
     */
    async session({ session, token, user }) {
      if (session.user) {
        const sessionUser = session.user as any
        // Prefer values from the database-backed `user` when available
        sessionUser.id = user?.id || token.id
        sessionUser.role = (user as any)?.role || token.role
        sessionUser.isFirstLogin = (token as any)?.isFirstLogin ?? false
        // Propagate phone into session from token or user
        sessionUser.phone = token.phone || (user as any)?.phone || null
      }
      return session
    },

    /**
     * Called when JWT token is created or updated
     * Preserves user id, role, and phone in the JWT
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || token.role
        // Propagate phone into token when present
        token.phone = (user as any).phone || token.phone || null
        // Propagate isFirstLogin set during signIn handler
        if ((user as any).isFirstLogin !== undefined) {
          ;(token as any).isFirstLogin = (user as any).isFirstLogin
        } else {
          ;(token as any).isFirstLogin = (token as any).isFirstLogin ?? false
        }
      }
      return token
    },
  }
}
