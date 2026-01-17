import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import crypto from 'crypto'
import { validateEmail } from '@/lib/auth-helpers'

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

  if (!identifier) {
    // Always return success to avoid revealing account existence
    return NextResponse.json({ ok: true })
  }

  const isEmail = validateEmail(identifier)
  const isPhone = !isEmail && /^\+?\d{10,15}$/.test(normalizePhone(identifier))

  let user = null
  if (isEmail) {
    user = await prisma.user.findUnique({ where: { email: identifier } })
  } else if (isPhone) {
    const normalized = normalizePhone(identifier)
    user = await prisma.user.findUnique({ where: { phone: normalized } })
  }

  // Generate token regardless; only persist if a user exists.
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000)

  // Determine client IP (try common headers used by proxies/CDNs)
  const xff = request.headers.get('x-forwarded-for') || ''
  const clientIp = (xff.split(',')[0].trim()) || request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || request.headers.get('true-client-ip') || 'unknown'

  // Log reset request for IP-based rate limiting
  try {
    await prisma.resetRequest.create({ data: { ip: clientIp } })
  } catch (err) {
    // swallow — logging failure shouldn't block the flow
    console.error('Failed to log reset request', err)
  }

  // Enforce per-IP rate limit
  try {
    const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000)
    const ipCount = await prisma.resetRequest.count({ where: { ip: clientIp, createdAt: { gte: windowStart } } })
    if (ipCount > IP_LIMIT) {
      console.warn(`IP rate limit exceeded for ${clientIp}`)
      return NextResponse.json({ ok: false, error: 'Too many reset requests. Please try again later.' }, { status: 429 })
    }
  } catch (err) {
    // if counting fails, allow request to proceed (do not block)
    console.error('Failed to count reset requests for IP', err)
  }

  if (user) {
    try {
      // Rate limiting: count recent requests for this user
      const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000)
      const recentCount = await prisma.passwordResetToken.count({
        where: {
          userId: user.id,
          createdAt: { gte: windowStart },
        },
      })

      const method = isEmail ? 'email' : 'phone'

      // Global daily SMS limit: configurable via RESET_SMS_DAILY_LIMIT env (default 1000)
      const smsDailyLimit = parseInt(process.env.RESET_SMS_DAILY_LIMIT || '1000', 10)
      if (method === 'phone') {
        try {
          // Count phone reset tokens created since start of current UTC day
          const now = new Date()
          const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0))
          const smsCountToday = await prisma.passwordResetToken.count({ where: { method: 'phone', createdAt: { gte: startOfDay } } })
          if (smsCountToday >= smsDailyLimit) {
            console.warn(`Global SMS daily limit reached (${smsCountToday} >= ${smsDailyLimit})`)
            return NextResponse.json({ ok: false, error: 'Too many reset requests. Please try again later.' }, { status: 429 })
          }
        } catch (err) {
          console.error('Failed to evaluate SMS daily limit', err)
          // Allow proceeding if counting fails
        }
      }

      const limitExceeded = (method === 'email' && recentCount >= EMAIL_LIMIT) || (method === 'phone' && recentCount >= PHONE_LIMIT)

      if (limitExceeded) {
        // Do not create another token, but return a generic rate-limit message.
        console.warn(`Rate limit exceeded for ${method} request (user ${user.id})`)
        return NextResponse.json({ ok: false, error: 'Too many reset requests. Please try again later.' }, { status: 429 })
      }

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
          method,
        },
      })
    } catch (err) {
      // Swallow DB errors to avoid leaking info
      console.error('Failed to create reset token', err)
    }

    // Placeholder: send email/SMS. Do not block on delivery.
    try {
      const host = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const resetLink = `${host.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`
      console.info(`Password reset link for user ${user.id}: ${resetLink}`)
    } catch (err) {
      // noop
    }
  }

  // Always respond OK and do not reveal whether user exists
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Password reset request endpoint' })
}
