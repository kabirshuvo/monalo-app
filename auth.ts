import NextAuth from 'next-auth'
import type { PrismaClient } from '@prisma/client'
import { authConfig } from '@/auth.config'
import { prisma } from '@/lib/db'
import { configureNewOAuthUser, handleOAuthSignIn } from '@/lib/auth/callbacks'
import { buildAuthProviders } from '@/lib/auth/oauth-providers'
import { MonaloPrismaAdapter } from '@/lib/auth/prisma-adapter'

const secret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === 'production' ? undefined : 'dev-secret-change-in-production')

if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error(
    'AUTH_SECRET (or NEXTAUTH_SECRET) is required in production. Generate: openssl rand -base64 32'
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret,
  adapter: MonaloPrismaAdapter(prisma as PrismaClient),
  providers: buildAuthProviders(),
  events: {
    async createUser({ user }) {
      if (user.id) {
        await configureNewOAuthUser(user.id, user.email)
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn(params) {
      if (params.account?.provider === 'credentials') {
        const signInCb = authConfig.callbacks?.signIn
        if (signInCb) {
          return signInCb(params)
        }
        return true
      }
      return handleOAuthSignIn(params.user)
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        if (user.id) {
          token.id = user.id
        } else if (user.email) {
          const byEmail = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() },
            select: { id: true },
          })
          if (byEmail) token.id = byEmail.id
        }

        if (user.role) {
          token.role = user.role
        } else if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, emailVerified: true, avatarUrl: true, level: true },
          })
          if (dbUser?.role) token.role = dbUser.role
          if (dbUser?.emailVerified) token.emailVerified = dbUser.emailVerified
          if (dbUser) {
            token.avatarUrl = dbUser.avatarUrl
            token.level = dbUser.level
          }
        }
        if (user.isFirstLogin !== undefined) {
          token.isFirstLogin = user.isFirstLogin
        }
        if (user.emailVerified) {
          token.emailVerified = user.emailVerified
        }
        if (user.avatarUrl !== undefined) {
          token.avatarUrl = user.avatarUrl
        }
      }

      if (!token.id && account?.providerAccountId && account.provider) {
        const linked = await prisma.account.findFirst({
          where: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
          select: { userId: true },
        })
        if (linked) token.id = linked.userId
      }

      if ((trigger === 'update' || token.avatarUrl === undefined) && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { avatarUrl: true, level: true, role: true },
        })
        if (dbUser) {
          token.avatarUrl = dbUser.avatarUrl
          token.level = dbUser.level
          if (!token.role) token.role = dbUser.role
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
          session.user.role = token.role
        }
        session.user.isFirstLogin = Boolean(token.isFirstLogin)
        if (token.emailVerified) {
          session.user.emailVerified = token.emailVerified as Date
        }
        if (token.avatarUrl !== undefined) {
          session.user.avatarUrl = token.avatarUrl as string | null
        }
        if (token.level !== undefined) {
          session.user.level = token.level as number
        }
      }
      return session
    },
  },
})
