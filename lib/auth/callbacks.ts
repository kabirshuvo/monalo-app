import type { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/db'

/**
 * Update user's lastLoginAt timestamp on successful sign-in
 * Only updates on initial sign-in, not on token refresh
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

    // Only update lastLoginAt on new session creation (account will be present)
    // Skip if this is a token refresh (account will be null for existing sessions)
    if (!account) {
      // Token refresh, don't update
      return true
    }

    // Prefer identifying the DB user by user.id; fall back to user.email (lowercased) if id not available
    const userId = user?.id
    const userEmail = user?.email?.toLowerCase() ?? null

    if (!userId && !userEmail) {
      console.warn('[Auth] Sign-in callback: No id or email found')
      // Allow sign-in even without id/email to not block authentication
      return true
    }

    // Lookup db user by id or email to compute isFirstLogin from lastLoginAt
    let dbUser: { lastLoginAt: Date | null; id: string } | null = null
    if (userId) {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { lastLoginAt: true, id: true },
      })
    } else if (userEmail) {
      dbUser = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { lastLoginAt: true, id: true },
      })
    }

    if (!dbUser) {
      console.warn('[Auth] Sign-in callback: User not found in database')
      // Allow sign-in even if user not found to not block authentication
      return true
    }

    const isFirstLogin = !dbUser.lastLoginAt

    // Update lastLoginAt for the resolved DB id
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { lastLoginAt: new Date() },
    })

    // Attach the isFirstLogin flag to the transient `user` object so it
    // can be propagated into the JWT in the `jwt` callback.
    if (user) {
      ;(user as any).isFirstLogin = isFirstLogin
    }

    const identifier = userEmail ? `email:${userEmail}` : userId ? `id:${userId}` : 'unknown'
    console.log(`[Auth] lastLoginAt updated for user: ${identifier} (firstLogin=${isFirstLogin})`)
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
        // Populate phone from token or user
        sessionUser.phone = (token as any)?.phone || (user as any)?.phone || null
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
        if ((user as any).phone !== undefined) {
          ;(token as any).phone = (user as any).phone
        }
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
