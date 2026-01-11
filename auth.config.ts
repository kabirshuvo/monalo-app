import type { NextAuthOptions } from 'next-auth'
import type { Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth-helpers'
import { Role } from '@prisma/client'

const authConfig: NextAuthOptions = {
  // Use Prisma adapter for database-backed sessions
  adapter: PrismaAdapter(prisma),
  // Database-backed sessions (persisted in DB via adapter)
  session: {
    strategy: 'database',
    // Session expiration: 30 days
    maxAge: 30 * 24 * 60 * 60,
    // Update session every 24 hours
    updateAge: 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            username: true,
            password: true,
            role: true,
          },
        })

        if (!user || !user.password) {
          throw new Error('User not found or not registered with password')
        }

        const isPasswordValid = await verifyPassword(credentials.password as string, user.password)
        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role || Role.CUSTOMER,
        }
      },
    }),
  ],
  pages: {
    signIn: '/(auth)/login',
    newUser: '/(auth)/register',
  },
  callbacks: {
    // Attach role to the JWT token (used if strategy is jwt, not db)
    async jwt({ token, user, account }) {
      // On initial login via credentials or OAuth
      if (user) {
        token.id = user.id
        token.role = (user as { role?: Role }).role || Role.CUSTOMER
      }
      // On subsequent session updates, fetch role from DB if needed
      if (!token.id && token.sub) {
        token.id = token.sub
        // For OAuth users created via adapter, fetch role from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        })
        if (dbUser) {
          token.role = dbUser.role
        }
      }
      return token
    },
    // Inject role and id into the session object
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { id: string; role: Role }).id = token.id as string
        ;(session.user as { id: string; role: Role }).role = (token.role as Role) || Role.CUSTOMER
      }
      return session
    },
  },
}

export default authConfig
