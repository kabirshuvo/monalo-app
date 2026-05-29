import type { User } from 'next-auth'
import type { AdapterUser } from '@auth/core/adapters'
import { prisma } from '@/lib/db'

/**
 * OAuth sign-in: sync JWT fields (role, emailVerified, lastLoginAt) from Prisma.
 */
export async function handleOAuthSignIn(user: User | AdapterUser): Promise<boolean> {
  try {
    const email = user.email?.toLowerCase()
    if (!email && !user.id) {
      return false
    }

    const dbUser = user.id
      ? await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, lastLoginAt: true, role: true, emailVerified: true, email: true },
        })
      : email
        ? await prisma.user.findUnique({
            where: { email },
            select: { id: true, lastLoginAt: true, role: true, emailVerified: true, email: true },
          })
        : null

    if (!dbUser) {
      return true
    }

    const isFirstLogin = !dbUser.lastLoginAt
    const now = new Date()

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        lastLoginAt: now,
        ...(!dbUser.emailVerified ? { emailVerified: now } : {}),
      },
    })

    user.id = dbUser.id
    user.role = dbUser.role
    user.isFirstLogin = isFirstLogin
    user.emailVerified = dbUser.emailVerified ?? now

    return true
  } catch (error) {
    console.error('[Auth] OAuth signIn callback error:', error)
    return true
  }
}

/**
 * After PrismaAdapter creates an OAuth user, set role and verified email.
 */
export async function configureNewOAuthUser(userId: string, email?: string | null): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: 'LEARNER',
        lastLoginAt: new Date(),
        ...(email ? { emailVerified: new Date() } : {}),
      },
    })
  } catch (error) {
    console.error('[Auth] configureNewOAuthUser error:', error)
  }
}
