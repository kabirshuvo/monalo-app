import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import crypto from 'crypto'
import { hashPassword, validatePassword } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const token = (body?.token || '').toString()
  const password = (body?.password || '').toString()

  if (!token || !password) {
    return NextResponse.json({ ok: false, error: 'The reset link is no longer valid.' }, { status: 400 })
  }

  const pwCheck = validatePassword(password)
  if (!pwCheck.valid) {
    return NextResponse.json({ ok: false, error: 'The reset link is no longer valid.' }, { status: 400 })
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const now = new Date()

  // Find matching, unused, unexpired token
  const record = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      used: false,
      expiresAt: { gt: now },
    },
    include: { user: true },
  })

  if (!record || !record.user) {
    return NextResponse.json({ ok: false, error: 'The reset link is no longer valid.' }, { status: 400 })
  }

  try {
    const hashed = await hashPassword(password)
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true, usedAt: now } }),
      prisma.passwordResetToken.updateMany({ where: { userId: record.userId, used: false, id: { not: record.id } }, data: { used: true, usedAt: now } }),
    ])
  } catch (err) {
    console.error('Failed to complete password reset', err)
    return NextResponse.json({ ok: false, error: 'The reset link is no longer valid.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Password reset confirm endpoint' })
}
