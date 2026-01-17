import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, validateEmail, validatePassword, validateUsername } from '@/lib/auth-helpers'
import { Role } from '@prisma/client'

interface RegisterRequest {
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  username?: string
  name?: string
  role?: string
}

interface RegisterResponse {
  ok: boolean
  user?: {
    id: string
    email: string | null
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

    const { email, phone, password, confirmPassword, username, name, role } = body

    // ============= Input Validation =============

    // Validate role
    const validRoles = ['BROWSER', 'LEARNER', 'CUSTOMER', 'SELLER', 'WRITER', 'DONOR']
    const userRole = role && validRoles.includes(role) ? role : 'BROWSER'

    // Normalize and validate contact info: email optional, phone optional
    const normalizedPhone = phone ? String(phone).replace(/[\s\-()]/g, '') : null

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

    // Username validation (optional, generate from email if not provided)
    let finalUsername: string
    if (!username) {
      if (email) {
        // Generate username from email: take part before @, sanitize
        finalUsername = String(email).split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30)
      } else if (name) {
        finalUsername = String(name).replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30)
      } else if (normalizedPhone) {
        finalUsername = `user_${String(normalizedPhone).slice(-6)}`
      } else {
        finalUsername = `user_${Date.now().toString().slice(-6)}`
      }
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
        email: email ? email.toLowerCase() : undefined,
        phone: normalizedPhone || null,
        password: hashedPassword,
        username: finalUsername,
        name: name || finalUsername,
        role: userRole as Role,
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
