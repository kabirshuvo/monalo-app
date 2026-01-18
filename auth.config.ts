import type { NextAuthOptions } from 'next-auth'
import type { Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import TwitterProvider from 'next-auth/providers/twitter'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth-helpers'
import { getAuthCallbacks } from '@/lib/auth/callbacks'
// Role removed from Prisma schema; use string fallbacks where needed
import NextAuth from 'next-auth'

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
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    // Facebook OAuth
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    // X (Twitter) OAuth
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      version: '2.0', // Use Twitter OAuth 2.0
    }),
    // Email or Phone / Password Credentials
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        const identifier = (credentials.identifier || '').trim()

        // Simple heuristics to detect email vs phone
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
        const isPhone = /^\+?[0-9 \-()]{7,20}$/.test(identifier)

        if (!isEmail && !isPhone) {
          throw new Error('Please provide a valid email or phone number')
        }

        let user: any | null = null
        if (isEmail) {
          user = await prisma.user.findUnique({
            where: { email: identifier.toLowerCase() },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
            },
          })
        } else {
          // Normalize phone to match stored format: keep digits and optional leading +
          const normalizedPhone = identifier.replace(/(?!^\+)\D/g, '')
          user = await prisma.user.findFirst({
            where: { phone: normalizedPhone },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
            },
          })
        }

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
          name: user.name || user.email,
          role: (user as any).role || 'CUSTOMER',
        }
      },
    }),
  ],
  pages: {
    signIn: '/(auth)/login',
    newUser: '/(auth)/register',
  },
  callbacks: getAuthCallbacks(),
}

// Export configuration as default for API route setup
export default authConfig
