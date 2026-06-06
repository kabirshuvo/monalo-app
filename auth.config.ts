import type { NextAuthConfig } from 'next-auth'
import type { Role } from '@prisma/client'
import { buildSessionCookieOptions } from '@/lib/auth/cookies'

const sessionCookieOptions = buildSessionCookieOptions()

/**
 * Edge-safe Auth.js config (no Prisma, no bcrypt).
 * Credentials provider is wired in `auth.ts` (authorize uses Prisma).
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
    newUser: '/',
    verifyRequest: '/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: sessionCookieOptions.secure
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
      options: sessionCookieOptions,
    },
    callbackUrl: {
      name: sessionCookieOptions.secure
        ? '__Secure-authjs.callback-url'
        : 'authjs.callback-url',
      options: { ...sessionCookieOptions, httpOnly: false },
    },
    csrfToken: {
      name: sessionCookieOptions.secure
        ? '__Host-authjs.csrf-token'
        : 'authjs.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: sessionCookieOptions.secure,
      },
    },
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      if (pathname.startsWith('/dashboard')) {
        return !!auth?.user
      }
      return true
    },
    async signIn({ user, account }) {
      if (account?.provider === 'credentials' && user.email) {
        if (!user.emailVerified) {
          const email = encodeURIComponent(user.email)
          return `/login?error=EmailNotVerified&email=${email}`
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        if (user.role) {
          token.role = user.role as Role
        }
        if (user.isFirstLogin !== undefined) {
          token.isFirstLogin = user.isFirstLogin
        }
        if (user.emailVerified) {
          token.emailVerified = user.emailVerified
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id as string
        }
        if (token.role) {
          session.user.role = token.role as Role
        }
        session.user.isFirstLogin = Boolean(token.isFirstLogin)
        if (token.emailVerified) {
          session.user.emailVerified = token.emailVerified as Date
        }
      }
      return session
    },
  },
} satisfies NextAuthConfig

export default authConfig
