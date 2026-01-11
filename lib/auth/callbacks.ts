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
    if (!account || !user?.email) {
      // Token refresh, don't update
      return true
    }

    const userEmail = user.email

    if (!userEmail) {
      console.warn('[Auth] Sign-in callback: No email found')
      return false
    }

    // Update lastLoginAt for the user
    await prisma.user.update({
      where: { email: userEmail },
      data: {
        lastLoginAt: new Date(),
      },
    })

    console.log(`[Auth] Updated lastLoginAt for user: ${userEmail}`)
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
     * Injects user role and id into the session
     */
    async session({ session, user }) {
      if (session.user && user) {
        const sessionUser = session.user as any
        sessionUser.id = user.id
        sessionUser.role = (user as any).role
      }
      return session
    },

    /**
     * Called when JWT token is created or updated
     * Preserves user id and role in the JWT
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
  }
}
