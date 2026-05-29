import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, validateEmail, validatePassword } from '@/lib/auth-helpers'
import { createEmailVerificationToken } from '@/lib/auth/verification'
import { sendVerificationEmail } from '@/lib/email/resend'

interface RegisterRequest {
  email?: string
  phone?: string
  password?: string
  name?: string
}

interface RegisterResponse {
  ok: boolean
  user?: {
    id: string
    email: string | null
    name: string | null
  }
  verificationEmailSent?: boolean
  error?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<RegisterResponse>> {
  try {
    let body: RegisterRequest
    try {
      body = await req.json()
    } catch {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { email, phone, password, name } = body

    const normalizedEmail = email ? String(email).trim().toLowerCase() : null
    const normalizedPhone = phone ? String(phone).trim().replace(/(?!^\+)\D/g, '') : null

    if (normalizedEmail && !validateEmail(normalizedEmail)) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (normalizedPhone && !/^\+?[0-9]{7,20}$/.test(normalizedPhone)) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Invalid phone format' },
        { status: 400 }
      )
    }

    if (!normalizedEmail && !normalizedPhone) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Please provide an email or phone number' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: passwordValidation.error },
        { status: 400 }
      )
    }

    if (normalizedEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })

      if (existingEmail) {
        return NextResponse.json<RegisterResponse>(
          { ok: false, error: 'Email already registered' },
          { status: 409 }
        )
      }
    }

    if (normalizedPhone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: normalizedPhone },
      })

      if (existingPhone) {
        return NextResponse.json<RegisterResponse>(
          { ok: false, error: 'Phone already registered' },
          { status: 409 }
        )
      }
    }

    const hashedPassword = await hashPassword(password)

    let user
    try {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          phone: normalizedPhone,
          password: hashedPassword,
          name: name || null,
          role: 'LEARNER',
          emailVerified: normalizedEmail ? null : new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        return NextResponse.json<RegisterResponse>(
          { ok: false, error: 'Unique constraint violation' },
          { status: 409 }
        )
      }

      console.error('[register] prisma.user.create error:', err)
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Failed to create user' },
        { status: 500 }
      )
    }

    let verificationEmailSent = false

    if (normalizedEmail) {
      try {
        const token = await createEmailVerificationToken(normalizedEmail)
        const emailResult = await sendVerificationEmail(normalizedEmail, token)
        verificationEmailSent = emailResult.ok

        if (!emailResult.ok) {
          console.error('[register] verification email failed:', emailResult.error)
        }
      } catch (err) {
        console.error('[register] verification token/email error:', err)
      }
    }

    return NextResponse.json<RegisterResponse>(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        verificationEmailSent,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('[register] Error:', error)

    return NextResponse.json<RegisterResponse>(
      { ok: false, error: 'An unexpected error occurred during registration' },
      { status: 500 }
    )
  }
}
