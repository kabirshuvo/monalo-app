import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, validateEmail, validatePassword, validateUsername } from '@/lib/auth-helpers'
import { Role } from '@prisma/client'

interface RegisterRequest {
  email?: string
  password?: string
  confirmPassword?: string
  username?: string
}

interface RegisterResponse {
  ok: boolean
  user?: {
    id: string
    email: string
    username: string
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

    const { email, password, confirmPassword, username } = body

    // ============= Input Validation =============

    // Email validation
    if (!email) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Invalid email format' },
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

    // Password confirmation
    if (!confirmPassword) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Password confirmation is required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Username validation (optional, generate from email if not provided)
    let finalUsername: string
    if (!username) {
      // Generate username from email: take part before @, sanitize
      finalUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30)
      // Ensure it starts with alphanumeric
      if (!/^[a-zA-Z0-9]/.test(finalUsername)) {
        finalUsername = `user_${Date.now().toString().slice(-6)}`
      }
    } else {
      if (!validateUsername(username)) {
        return NextResponse.json<RegisterResponse>(
          {
            ok: false,
            error:
              'Username must be 3-30 characters, alphanumeric and underscores only (no leading/trailing underscores)',
          },
          { status: 400 }
        )
      }
      finalUsername = username
    }

    // ============= Duplicate Check =============

    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingEmail) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: finalUsername },
    })

    if (existingUsername) {
      return NextResponse.json<RegisterResponse>(
        { ok: false, error: 'Username already taken' },
        { status: 409 }
      )
    }

    // ============= Hash Password =============

    const hashedPassword = await hashPassword(password)

    // ============= Create User =============

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        username: finalUsername,
        role: Role.CUSTOMER, // Default role
        isVerified: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        // Explicitly exclude password from response
      },
    })

    // ============= Return Success Response =============

    return NextResponse.json<RegisterResponse>(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
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
