import type { Session } from 'next-auth'
import type { JWT } from '@auth/core/jwt'
import { prisma } from '@/lib/db'
import { resolveDatabaseUserId } from '@/lib/auth/resolve-user-id'

type SessionLike = {
  user?: {
    id?: string | null
    email?: string | null
    name?: string | null
    image?: string | null
  } | null
}

/**
 * Resolve the Prisma user id for the current session. If OAuth left a valid JWT
 * but no `users` row (adapter/DB glitch), create or reconnect the learner row.
 */
export async function ensureDatabaseUserForAuth(
  session: SessionLike,
  jwt?: JWT | null
): Promise<string | null> {
  const emailRaw =
    session.user?.email ?? (typeof jwt?.email === 'string' ? jwt.email : null)
  const email = emailRaw?.trim().toLowerCase() ?? ''

  let userId = await resolveDatabaseUserId({
    id: session.user?.id,
    email: email || null,
    sub: jwt?.sub,
  })

  if (userId) return userId

  if (!email) return null

  const repaired = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: session.user?.name ?? null,
      avatarUrl: session.user?.image ?? null,
      role: 'LEARNER',
      emailVerified: new Date(),
      lastLoginAt: new Date(),
    },
    update: {
      lastLoginAt: new Date(),
      ...(session.user?.name ? { name: session.user.name } : {}),
      ...(session.user?.image ? { avatarUrl: session.user.image } : {}),
    },
    select: { id: true },
  })

  return repaired.id
}

export async function ensureDatabaseUserForSession(
  session: Session | null
): Promise<string | null> {
  if (!session?.user) return null
  return ensureDatabaseUserForAuth(session)
}
