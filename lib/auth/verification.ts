import { prisma } from '@/lib/db'

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000

/** Generate a 32-character hex token (edge-safe Web Crypto). */
export function generateVerificationToken(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Persist a verification token for the given email (identifier column). */
export async function createEmailVerificationToken(email: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase()
  const token = generateVerificationToken()
  const expires = new Date(Date.now() + VERIFICATION_TTL_MS)

  await prisma.verificationToken.deleteMany({
    where: { identifier: normalizedEmail },
  })

  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token,
      expires,
    },
  })

  return token
}

export type VerifyEmailResult =
  | { ok: true; email: string }
  | { ok: false; error: 'missing' | 'invalid' | 'expired' | 'not_found' }

/** Validate token, mark user verified, and remove the token row. */
export async function verifyEmailByToken(rawToken: string): Promise<VerifyEmailResult> {
  const token = rawToken.trim()
  if (!token) {
    return { ok: false, error: 'missing' }
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record) {
    return { ok: false, error: 'invalid' }
  }

  if (record.expires.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => undefined)
    return { ok: false, error: 'expired' }
  }

  const email = record.identifier.toLowerCase()

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (!user) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => undefined)
    return { ok: false, error: 'not_found' }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ])

  return { ok: true, email }
}
