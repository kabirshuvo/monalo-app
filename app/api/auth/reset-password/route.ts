import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import crypto from 'crypto'
import { hashPassword, validatePassword } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const token = (body?.token || '').toString()
  const password = (body?.password || '').toString()

  // Do not reveal whether the token or account is valid. Validate inputs minimally,
  // but always return the same generic success response to callers.
  if (!token || !password) {
    return NextResponse.json({ ok: true })
  }

  const pwCheck = validatePassword(password)
  if (!pwCheck.valid) {
    // Log server-side but return generic success to the caller
    console.warn('Password validation failed during reset attempt')
    return NextResponse.json({ ok: true })
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  // Find token record that matches, is not used, and not expired
  const now = new Date()
  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      used: false,
      expiresAt: { gt: now },
    },
    include: { user: true },
  })

  if (!resetRecord || !resetRecord.user) {
    // Do not reveal token validity to the client
    return NextResponse.json({ ok: true })
  }

  // Update user password and mark token as used in a transaction
  try {
    const hashed = await hashPassword(password)
    const now = new Date()
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetRecord.userId }, data: { password: hashed } }),
      prisma.passwordResetToken.update({ where: { id: resetRecord.id }, data: { used: true, usedAt: now } }),
      prisma.passwordResetToken.updateMany({ where: { userId: resetRecord.userId, used: false, id: { not: resetRecord.id } }, data: { used: true, usedAt: now } }),
    ])
  } catch (err) {
    // Log internal error but do not reveal details to the client
    console.error('Failed to reset password', err)
    return NextResponse.json({ ok: true })
  }

  // Success — still return the same generic response
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Password reset endpoint' })
}
