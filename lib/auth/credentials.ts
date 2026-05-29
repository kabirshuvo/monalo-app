import type { Role } from '@prisma/client'
import type { User } from 'next-auth'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth-helpers'

const credentialsUserSelect = {
  id: true,
  email: true,
  name: true,
  password: true,
  role: true,
  lastLoginAt: true,
  emailVerified: true,
} as const

type CredentialsDbUser = {
  id: string
  email: string | null
  name: string | null
  password: string | null
  role: Role
  lastLoginAt: Date | null
  emailVerified: Date | null
}

/**
 * Credentials authorize — runs in Node/Worker with Prisma Accelerate (not in middleware).
 */
export async function authorizeCredentials(
  credentials: Partial<Record<'identifier' | 'password', unknown>>
): Promise<User | null> {
  const identifier = typeof credentials.identifier === 'string' ? credentials.identifier.trim() : ''
  const password = typeof credentials.password === 'string' ? credentials.password : ''

  if (!identifier || !password) {
    return null
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
  const isPhone = /^\+?[0-9 \-()]{7,20}$/.test(identifier)

  if (!isEmail && !isPhone) {
    return null
  }

  let user: CredentialsDbUser | null = null

  if (isEmail) {
    user = await prisma.user.findUnique({
      where: { email: identifier.toLowerCase() },
      select: credentialsUserSelect,
    })
  } else {
    const normalizedPhone = identifier.replace(/(?!^\+)\D/g, '')
    user = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
      select: credentialsUserSelect,
    })
  }

  if (!user?.password) {
    return null
  }

  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    return null
  }

  const isFirstLogin = !user.lastLoginAt

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  return {
    id: user.id,
    email: user.email ?? undefined,
    name: user.name ?? user.email ?? undefined,
    role: user.role,
    isFirstLogin,
    emailVerified: user.emailVerified,
  }
}
