/**
 * ROLE-BASED ACCESS CONTROL (RBAC) USAGE GUIDE
 * 
 * This file provides examples of how to use the RBAC helper functions
 * in your API routes, server components, and middleware.
 */

// ============================================================================
// 1. BASIC ROLE CHECKING IN API ROUTES
// ============================================================================

/*
Example: Admin-only endpoint to create a product

// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/role'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Require ADMIN role - throws error if not authorized
    const session = await requireRole('ADMIN')
    
    const body = await request.json()
    
    // Create product with audit fields
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        price: body.price,
        createdBy: (session.user as any).id, // Audit field
      },
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
*/

// ============================================================================
// 2. MULTIPLE ROLE CHECKING
// ============================================================================

/*
Example: Endpoint accessible by ADMIN or WRITER

// app/api/blog/route.ts
import { requireRole } from '@/lib/auth/role'

export async function POST(request: NextRequest) {
  try {
    // Accept multiple roles
    const session = await requireRole(['ADMIN', 'WRITER'])
    
    // Endpoint logic here
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }
  }
}
*/

// ============================================================================
// 3. GRACEFUL ROLE CHECKING (NO THROW)
// ============================================================================

/*
Example: Check role and handle gracefully

// app/api/courses/route.ts
import { hasRole, getCurrentRole } from '@/lib/auth/role'

export async function GET(request: NextRequest) {
  const isAdmin = await hasRole('ADMIN')
  
  if (isAdmin) {
    // Return all courses including unpublished
    return NextResponse.json(allCourses)
  } else {
    // Return only published courses
    return NextResponse.json(publishedCourses)
  }
}
*/

// ============================================================================
// 4. HIGHER-ORDER FUNCTION PATTERN
// ============================================================================

/*
Example: Using withRole() to wrap handlers

// app/api/admin/users/route.ts
import { withRole } from '@/lib/auth/role'
import { NextResponse } from 'next/server'

export const GET = withRole('ADMIN', async (request) => {
  // This code only runs if user is ADMIN
  const users = await prisma.user.findMany()
  return NextResponse.json(users)
})

export const DELETE = withRole('ADMIN', async (request) => {
  // This code only runs if user is ADMIN
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('id')
  
  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ success: true })
})
*/

// ============================================================================
// 5. PERMISSION-BASED CHECKING
// ============================================================================

/*
Example: Check specific permissions

// app/api/analytics/route.ts
import { getCurrentRole, requirePermission } from '@/lib/auth/role'

export async function GET(request: NextRequest) {
  const role = await getCurrentRole()
  
  if (!role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    // Require specific permission
    requirePermission(role, 'view:analytics')
    
    const analytics = await getAnalytics()
    return NextResponse.json(analytics)
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }
  }
}
*/

// ============================================================================
// 6. SERVER COMPONENT USAGE
// ============================================================================

/*
Example: Protecting server component with role requirement

// app/dashboard/admin/page.tsx
import { requireRole } from '@/lib/auth/role'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  try {
    // Require ADMIN role in server component
    const session = await requireRole('ADMIN')
    
    return (
      <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome, {session.user.email}</p>
      </div>
    )
  } catch (error) {
    // Redirect unauthorized users to login
    redirect('/(auth)/login')
  }
}
*/

// ============================================================================
// 7. GETTING CURRENT USER INFO
// ============================================================================

/*
Example: Accessing current user without requiring a role

// app/api/profile/route.ts
import { getCurrentUserId, getCurrentRole, getCurrentSession } from '@/lib/auth/role'

export async function GET(request: NextRequest) {
  // Get user ID (returns null if not authenticated)
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  // Get user's role
  const role = await getCurrentRole()
  
  // Get full session
  const session = await getCurrentSession()
  
  // Fetch user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  
  return NextResponse.json({ user, role })
}
*/

// ============================================================================
// 8. ROLE MATRIX AND PERMISSIONS
// ============================================================================

/*
Built-in Role Permissions:

ADMIN:
- manage:users (CRUD operations on users)
- manage:products (CRUD operations on products)
- manage:courses (CRUD operations on courses)
- manage:orders (CRUD operations on orders)
- manage:blog (CRUD operations on blog posts)
- view:analytics (View dashboard analytics)
- manage:settings (Change system settings)

CUSTOMER:
- view:products (Browse products)
- purchase:products (Buy products)
- view:orders (View own orders)
- view:courses (View courses)
- view:blog (Read blog posts)

LEARNER:
- view:courses (Browse courses)
- view:lessons (Watch lessons)
- track:progress (Save lesson progress)
- view:blog (Read blog posts)

WRITER:
- create:blog (Create blog posts)
- edit:blog (Edit own blog posts)
- view:blog (Read blog posts)
- view:courses (View courses)

You can extend these in lib/auth/role.ts:
rolePermissions[Role] = ['permission1', 'permission2', ...]
*/

// ============================================================================
// 9. CUSTOM MIDDLEWARE INTEGRATION
// ============================================================================

/*
Example: Middleware to protect routes by role

// app/middleware.ts
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const pathname = request.nextUrl.pathname
  
  // Protect admin routes
  if (pathname.startsWith('/dashboard/admin')) {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/(auth)/login', request.url))
    }
  }
  
  // Protect writer routes
  if (pathname.startsWith('/dashboard/writer')) {
    if (!token || !['ADMIN', 'WRITER'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/(auth)/login', request.url))
    }
  }
  
  // Protect learner routes
  if (pathname.startsWith('/dashboard/learner')) {
    if (!token || !['ADMIN', 'LEARNER', 'CUSTOMER'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/(auth)/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/courses/:path*',
  ],
}
*/

// ============================================================================
// 10. ERROR HANDLING PATTERNS
// ============================================================================

/*
Example: Comprehensive error handling

// app/api/protected/route.ts
import { requireRole, AuthorizationError } from '@/lib/auth/role'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await requireRole('ADMIN')
    
    // Protected logic here
    
    return NextResponse.json({ success: true })
  } catch (error) {
    // Handle authorization errors
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.statusCode === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        },
        { status: error.statusCode }
      )
    }
    
    // Handle unexpected errors
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
*/

// ============================================================================
// 11. TESTING RBAC
// ============================================================================

/*
Test with Different Roles:

1. Admin User (unrestricted access):
   Email: admin@example.com
   Password: admin123
   
   Can access:
   - POST /api/products (create)
   - PATCH /api/products/:id (update)
   - DELETE /api/products/:id (delete)
   - GET /api/admin/users
   - All admin routes

2. Writer User:
   Email: writer@example.com
   Password: writer123
   
   Can access:
   - POST /api/blog (create posts)
   - PATCH /api/blog/:id (edit own posts)
   - GET /api/courses
   
   Cannot access:
   - Admin endpoints (403 Forbidden)
   - /api/admin/* routes

3. Customer User:
   Email: customer@example.com
   Password: customer123
   
   Can access:
   - GET /api/products
   - POST /api/orders (make purchases)
   - GET /api/orders (view own orders)
   
   Cannot access:
   - POST /api/products (403 Forbidden)
   - /api/admin/* routes

4. Unauthenticated User:
   
   Gets 401 Unauthorized errors on:
   - Any protected endpoint
   - Any API route requiring role
*/

export {}
