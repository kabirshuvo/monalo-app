import type { JWT } from '@auth/core/jwt'
import { prisma } from '@/lib/db'

function isDbConnectionError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? '')
  return (
    msg.includes("Can't reach database server") ||
    msg.includes('Failed to connect') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT')
  )
}

export type ResolveUserIdInput = {
  id?: string | null
  email?: string | null
  /** Auth.js `sub` — often the OAuth provider subject when `id` is wrong */
  sub?: string | null
}

/**
 * JWT `sub` / OAuth profile ids are not always the Prisma User primary key.
 * Resolve the canonical database user id by id, email, OAuth account link, then sub.
 */
export async function resolveDatabaseUserId(
  input: ResolveUserIdInput
): Promise<string | null> {
  const id = typeof input.id === 'string' ? input.id.trim() : ''
  const email =
    typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''

  try {
    if (id) {
      const byId = await prisma.user.findUnique({
        where: { id },
        select: { id: true },
      })
      if (byId) return byId.id

      const byAccountId = await prisma.account.findFirst({
        where: { providerAccountId: id },
        select: { userId: true },
      })
      if (byAccountId) return byAccountId.userId
    }

    if (email) {
      const byEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
      if (byEmail) return byEmail.id
    }

    const sub = typeof input.sub === 'string' ? input.sub.trim() : ''
    if (sub && sub !== id) {
      const bySubUser = await prisma.user.findUnique({
        where: { id: sub },
        select: { id: true },
      })
      if (bySubUser) return bySubUser.id

      const bySubAccount = await prisma.account.findFirst({
        where: { providerAccountId: sub },
        select: { userId: true },
      })
      if (bySubAccount) return bySubAccount.userId
    }

    return null
  } catch (error) {
    if (isDbConnectionError(error)) {
      console.error('[Auth] Database unreachable during user id resolve — using cached id')
      return id || null
    }
    throw error
  }
}

export async function resolveDatabaseUserIdFromJwt(
  token: JWT
): Promise<string | null> {
  return resolveDatabaseUserId({
    id: token.id as string | undefined,
    email: (token.email as string | undefined) ?? null,
    sub: token.sub,
  })
}

export async function resolveDatabaseUserIdFromSession(session: {
  user?: {
    id?: string | null
    email?: string | null
  } | null
}): Promise<string | null> {
  const user = session.user
  if (!user) return null
  return resolveDatabaseUserId({
    id: user.id,
    email: user.email,
  })
}
