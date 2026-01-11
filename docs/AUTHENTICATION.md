/**
 * AUTHENTICATION SETUP GUIDE
 * 
 * This document explains the complete authentication flow and how to use it.
 */

// ============================================================================
// 1. ENVIRONMENT VARIABLES SETUP
// ============================================================================

/*
Required environment variables in .env.local:

DATABASE_URL="postgresql://user:password@localhost:5432/monalo?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/monalo?schema=public"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000" (for development)

Generate NEXTAUTH_SECRET with:
$ openssl rand -base64 32

Example output: "dG9wLXNlY3JldC1rZXktY2hhbmdlLXRoaXMtaW4tcHJvZHVjdGlvbg=="

For production, use environment-specific values:
- Development: http://localhost:3000
- Production: https://yourdomain.com
*/

// ============================================================================
// 2. AUTHENTICATION ARCHITECTURE
// ============================================================================

/*
Components:
1. auth.config.ts - NextAuth configuration (providers, callbacks, session strategy)
2. app/api/auth/[...nextauth]/route.ts - API route handler
3. lib/auth/callbacks.ts - Callback functions for signIn, session, jwt
4. lib/auth-helpers.ts - Password hashing/verification utilities
5. lib/auth/audit.ts - Audit field utilities (createdBy, updatedBy, lastLoginAt)
6. lib/db/soft-delete.ts - Soft delete utilities

Flow:
1. User submits credentials (email/password) to POST /api/auth/callback/credentials
2. CredentialsProvider.authorize() validates credentials
3. Password verified against bcrypt hash in database
4. On success, signIn callback updates lastLoginAt
5. Session created and stored in database
6. User session includes id and role for authorization
*/

// ============================================================================
// 3. CREDENTIALS-BASED AUTHENTICATION
// ============================================================================

/*
Sign In Flow:

1. POST /api/auth/signin (redirects to login page if not authenticated)
   - User submits email and password

2. Credentials verified via:
   - prisma.user.findUnique({ where: { email } })
   - verifyPassword(inputPassword, storedHash)

3. On success:
   - signIn callback triggers
   - lastLoginAt updated to current timestamp
   - User object returned: { id, email, name, role }

4. Session created:
   - Stored in database (PrismaAdapter)
   - Session token generated
   - User id and role injected

5. User can access protected routes with valid session

Sign Out Flow:

1. POST /api/auth/signout
   - Session invalidated
   - Database session record deleted
   - Redirect to sign-in page
*/

// ============================================================================
// 4. PASSWORD MANAGEMENT
// ============================================================================

/*
Password Hashing:

import { hashPassword, verifyPassword } from '@/lib/auth-helpers'

// Hash password (10 salt rounds for bcrypt)
const hash = await hashPassword('user-password')
// Stores in database as: password field in users table

// Verify password on login
const isValid = await verifyPassword('user-input', storedHash)

Password Requirements (validated in registration):
- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)

Example valid passwords:
- MyPassword123
- Secure@Pass456
- ChangeMe789
*/

// ============================================================================
// 5. SESSION MANAGEMENT
// ============================================================================

/*
Database Sessions (Recommended):

Strategy: 'database' (stored in database)
Max Age: 30 days (2592000 seconds)
Update Age: 24 hours (86400 seconds)

Sessions are:
- Persistent (survive server restarts)
- Secure (can't be forged without database access)
- Auditable (stored in sessions table)

Session Structure:
{
  user: {
    id: "user-uuid",
    email: "user@example.com",
    name: "username",
    image: null,
    role: "CUSTOMER" // Injected by callback
  },
  expires: "2026-02-10T12:00:00.000Z"
}

Accessing session in components/routes:

// Server components
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'

export async function MyServerComponent() {
  const session = await getServerSession(authConfig)
  if (!session) {
    redirect('/(auth)/login')
  }
  const userId = session.user.id
  const role = session.user.role
}

// API routes
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = (session.user as any).id
}

// Client components
'use client'
import { useSession } from 'next-auth/react'

export function MyClientComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return <div>Not signed in</div>
  
  const userId = (session?.user as any).id
  const role = (session?.user as any).role
}
*/

// ============================================================================
// 6. ROLE-BASED ACCESS CONTROL
// ============================================================================

/*
User Roles:
- ADMIN: Full system access, manage users/products/content
- CUSTOMER: Can purchase products, view shop
- LEARNER: Can enroll in courses, view lessons
- WRITER: Can create/manage blog posts

Checking roles in API routes:

import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authConfig)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = (session.user as any).role
  
  if (userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Protected endpoint logic
}

Middleware protection (app/middleware.ts):

import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/(auth)/login', request.url))
    }
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
}
*/

// ============================================================================
// 7. LASTLOGINAT TRACKING
// ============================================================================

/*
The lastLoginAt field is automatically updated on successful authentication:

1. User submits credentials
2. Password verified
3. signIn callback executes
4. User.update({ where: { email }, data: { lastLoginAt: new Date() } })
5. Only happens on first sign-in, not on token refresh

Querying login activity:

import { prisma } from '@/lib/db'

// Get users who signed in this week
const recentUsers = await prisma.user.findMany({
  where: {
    deletedAt: null,
    lastLoginAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    }
  },
  orderBy: { lastLoginAt: 'desc' }
})

// Get inactive users (not signed in for 30 days)
const inactiveUsers = await prisma.user.findMany({
  where: {
    deletedAt: null,
    lastLoginAt: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  }
})
*/

// ============================================================================
// 8. AUDIT FIELDS IN AUTHENTICATION
// ============================================================================

/*
When a user is created (via registration or admin), audit fields are set:

createdBy: User ID of who created the account (null for self-registration)
updatedBy: User ID of who last modified the account
createdAt: Timestamp of account creation
updatedAt: Timestamp of last update
lastLoginAt: Timestamp of last successful login

Example registration with audit fields:

import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth-helpers'
import { getAuditContext, withCreatedBy } from '@/lib/auth/audit'

export async function POST(request: NextRequest) {
  const { userId } = await getAuditContext() // null for public registration
  
  const newUser = await prisma.user.create({
    data: withCreatedBy(
      {
        email: 'user@example.com',
        username: 'username',
        password: await hashPassword('password123'),
        role: 'CUSTOMER',
      },
      userId // null for self-registration
    )
  })
}
*/

// ============================================================================
// 9. TESTING AUTHENTICATION
// ============================================================================

/*
Test User Credentials (from seed script):

Admin User:
- Email: admin@example.com
- Password: admin123
- Role: ADMIN

Customer User:
- Email: customer@example.com
- Password: customer123
- Role: CUSTOMER

Learner User:
- Email: learner@example.com
- Password: learner123
- Role: LEARNER

To seed the database with test users:
$ npx prisma db seed

Then test login:
1. Go to /login
2. Enter email: admin@example.com
3. Enter password: admin123
4. Should redirect to home with session
*/

// ============================================================================
// 10. SECURITY BEST PRACTICES
// ============================================================================

/*
1. SECRETS MANAGEMENT:
   - Never commit .env.local to version control
   - Use strong, random NEXTAUTH_SECRET (32+ characters)
   - Different secrets for dev/staging/production
   - Rotate secrets periodically

2. PASSWORD SECURITY:
   - Passwords hashed with bcrypt (10 salt rounds)
   - Never store plaintext passwords
   - Minimum 8 characters required
   - Enforce complexity requirements

3. SESSION SECURITY:
   - Database-backed sessions (more secure than JWT-only)
   - Secure cookies with httpOnly, secure flags
   - Session expiration: 30 days
   - Session token refresh: 24 hours

4. RATE LIMITING:
   - Implement rate limiting on login endpoint
   - Prevent brute force attacks
   - Lock accounts after failed attempts

5. HTTPS:
   - Always use HTTPS in production
   - Set NEXTAUTH_URL to https://yourdomain.com
   - Secure cookies enabled in production

6. CSRF PROTECTION:
   - NextAuth includes CSRF protection
   - Verify tokens in state-changing operations
   - Use POST for sign-in/sign-out

7. AUDIT LOGGING:
   - Log all authentication events
   - Track failed login attempts
   - Monitor account creation/deletion
   - Review lastLoginAt timestamps

8. PASSWORD RESET:
   - Implement secure password reset flow
   - Use time-limited tokens
   - Verify email address
   - Require strong new password
*/

// ============================================================================
// 11. TROUBLESHOOTING
// ============================================================================

/*
Common Issues:

1. "NEXTAUTH_SECRET is not set"
   Fix: Generate with: openssl rand -base64 32
   Add to .env.local: NEXTAUTH_SECRET="value"

2. "User not found" after sign-in
   Fix: Run seed script: npx prisma db seed
   Check user exists: npx prisma studio

3. "Password invalid" even with correct password
   Fix: Ensure passwords are hashed with bcrypt
   Check password verification logic in auth-helpers.ts

4. Session not persisting across page reloads
   Fix: Check DATABASE_URL is correct
   Verify SessionToken table exists in database
   Check browser cookies are enabled

5. Role not in session
   Fix: Check JWT callback includes role
   Verify session callback injects role
   Check User model has role field

6. lastLoginAt not updating
   Fix: Verify signIn callback is defined
   Check handleSignIn function in callbacks.ts
   Ensure Prisma can write to database
*/

export {}
