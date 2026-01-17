import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, validateEmail, validatePassword } from '@/lib/auth-helpers'
import { Role } from '@prisma/client'

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
    role: Role
  }
  error?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<RegisterResponse>> {
  try {
    // Parse and validate request body
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

    // ============= Input Validation =============

    // Normalize and validate contact info: email optional, phone optional
    // Keep only digits and an optional leading plus
    const normalizedPhone = phone ? String(phone).trim().replace(/(?!^\+)\D/g, '') : null

    if (email) {
      if (!validateEmail(email)) {
        return NextResponse.json<RegisterResponse>(
          { ok: false, error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // If phone provided, ensure it's plausible after normalization
    if (normalizedPhone) {
      if (!/^\+?[0-9]{7,20}$/.test(normalizedPhone)) {
        return NextResponse.json<RegisterResponse>(
          { ok: false, error: 'Invalid phone format' },
          { status: 400 }
        )
      }
    }

    // Require at least one contact method
    if (!email && !normalizedPhone) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Please provide an email or phone number' },
        { status: 400 }
      )
    }

    // Password validation
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

    // ============= Duplicate Check =============
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
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

    // No username handling: keep registration focused on name/email/phone/password

    // ============= Hash Password =============

    const hashedPassword = await hashPassword(password)

    // ============= Create User =============

    const user = await prisma.user.create({
      data: {
        email: email ? email.toLowerCase() : undefined,
        phone: normalizedPhone || null,
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    // ============= Return Success Response =============

    return NextResponse.json<RegisterResponse>(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    console.error('[register] Error:', error)

    return NextResponse.json<RegisterResponse>(
      { ok: false, error: 'An unexpected error occurred during registration' },
      { status: 500 }
    )
  }
}
