import type { NextAuthOptions, User } from 'next-auth'
import type { AdapterUser } from 'next-auth/adapters'
import type { JWT } from 'next-auth/jwt'
import { prisma } from '@/lib/db'

type SignInUser = User | AdapterUser

/**
 * Update user's lastLoginAt timestamp on successful sign-in
 * Only updates on initial sign-in, not on token refresh
 * @param user - NextAuth user object
 * @param account - NextAuth account object (null for existing sessions)
 * @returns boolean - whether to allow the sign-in
 */
export async function handleSignIn(params: {
  profile?: unknown
  account?: unknown
  user?: SignInUser
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

    // Read existing lastLoginAt to detect first login
    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { lastLoginAt: true, id: true },
    })

    const isFirstLogin = !dbUser?.lastLoginAt

    // Update lastLoginAt to now on every successful sign-in
    await prisma.user.update({
      where: { email: userEmail },
      data: { lastLoginAt: new Date() },
    })

    // Attach the isFirstLogin flag to the transient `user` object so it
    // can be propagated into the JWT in the `jwt` callback.
    if (user && 'isFirstLogin' in user) {
      user.isFirstLogin = isFirstLogin
    }

    console.log(`[Auth] lastLoginAt updated for user: ${userEmail} (firstLogin=${isFirstLogin})`)
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
    async session({ session, token, user }) {
      if (session.user) {
        // Database sessions: `user` is the adapter row (authoritative for id + role).
        // Credentials / JWT path: fall back to token values set at sign-in.
        const id = user?.id ?? token.id
        const role = user?.role ?? token.role

        if (id) {
          session.user.id = id
        }
        if (role) {
          session.user.role = role
        }
        session.user.isFirstLogin = token.isFirstLogin ?? false
      }
      return session
    },

    /**
     * Called when JWT token is created or updated
     * Preserves user id and role in the JWT
     */
    async jwt({ token, user }) {
      if (user) {
        const jwt = token as JWT
        jwt.id = user.id
        if (user.role) {
          jwt.role = user.role
        }
        if (user.isFirstLogin !== undefined) {
          jwt.isFirstLogin = user.isFirstLogin
        } else {
          jwt.isFirstLogin = jwt.isFirstLogin ?? false
        }
      }
      return token
    },
  }
}
