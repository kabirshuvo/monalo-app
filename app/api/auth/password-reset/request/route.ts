import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import crypto from 'crypto'
import { validateEmail } from '@/lib/validators'
import { textBody, htmlBody, smsBody } from '@/lib/email/resetPasswordTemplate'

const TOKEN_EXPIRATION_MINUTES = 30
const RATE_WINDOW_MINUTES = 15
const EMAIL_LIMIT = 3
const PHONE_LIMIT = 2
const IP_LIMIT = 10

function normalizePhone(input: string) {
  const s = input.trim()
  const plus = s.startsWith('+') ? '+' : ''
  const digits = s.replace(/[^0-9]/g, '')
  return plus + digits
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const identifier = (body?.identifier || '').toString().trim()

  // Generic success message to avoid account enumeration
  const genericSuccess = NextResponse.json({ ok: true })

  if (!identifier) return genericSuccess

  const isEmail = validateEmail(identifier)
  const isPhone = !isEmail && /^\+?\d{10,15}$/.test(normalizePhone(identifier))

  // Try to resolve user by email or normalized phone
  let user = null
  if (isEmail) {
    user = await prisma.user.findUnique({ where: { email: identifier } })
  } else if (isPhone) {
    const normalized = normalizePhone(identifier)
    user = await prisma.user.findUnique({ where: { phone: normalized } })
  }

  // Determine client IP (common proxy headers)
  const xff = request.headers.get('x-forwarded-for') || ''
  const clientIp = (xff.split(',')[0].trim()) || request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || request.headers.get('true-client-ip') || 'unknown'

  // Log reset request for IP-based rate limiting (best-effort)
  try {
    await prisma.resetRequest.create({ data: { ip: clientIp } })
  } catch (err) {
    console.error('Failed to log reset request', err)
  }

  // Enforce per-IP rate limit
  try {
    const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000)
    const ipCount = await prisma.resetRequest.count({ where: { ip: clientIp, createdAt: { gte: windowStart } } })
    if (ipCount > IP_LIMIT) {
      return NextResponse.json({ ok: false, error: 'Too many reset requests. Please try again later.' }, { status: 429 })
    }
  } catch (err) {
    console.error('Failed to count reset requests for IP', err)
  }

  // Generate token regardless; only persist if user exists
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000)

  if (user) {
    try {
      // Per-user recent request count
      const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000)
      const recentCount = await prisma.passwordResetToken.count({ where: { userId: user.id, createdAt: { gte: windowStart } } })

      const method = isEmail ? 'email' : 'phone'

      // Global daily SMS limit (env or default)
      const smsDailyLimit = parseInt(process.env.RESET_SMS_DAILY_LIMIT || '1000', 10)
      if (method === 'phone') {
        try {
          const now = new Date()
          const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0))
          const smsCountToday = await prisma.passwordResetToken.count({ where: { method: 'phone', createdAt: { gte: startOfDay } } })
          if (smsCountToday >= smsDailyLimit) {
            return NextResponse.json({ ok: false, error: 'Too many reset requests. Please try again later.' }, { status: 429 })
          }
        } catch (err) {
          console.error('Failed to evaluate SMS daily limit', err)
        }
      }

      const limitExceeded = (method === 'email' && recentCount >= EMAIL_LIMIT) || (method === 'phone' && recentCount >= PHONE_LIMIT)
      if (limitExceeded) {
        return NextResponse.json({ ok: false, error: 'Too many reset requests. Please try again later.' }, { status: 429 })
      }

      // Create password reset token record with hashed token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
          method,
        },
      })

      // Stubbed send: email or SMS
      try {
        const host = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const resetLink = `${host.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`

        if (method === 'email') {
          // Placeholder: send email using template
          const subject = 'Reset your MonAlo password'
          const text = textBody(resetLink)
          const html = htmlBody(resetLink)
          console.info(`Send email to user ${user.id} (${user.email}) — subject: ${subject}`)
          console.info(text)
        } else {
          // Placeholder: send SMS using template
          const sms = smsBody(resetLink)
          console.info(`Send SMS to user ${user.id} (${user.phone}) — message: ${sms}`)
        }
      } catch (err) {
        console.error('Failed to send reset notification', err)
      }
    } catch (err) {
      console.error('Failed to create reset token', err)
    }
  }

  // Always return generic success to caller (avoid account enumeration)
  return genericSuccess
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Password reset request endpoint' })
}
