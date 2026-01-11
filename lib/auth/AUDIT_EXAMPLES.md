/**
 * EXAMPLE: How to use audit field utilities in API routes
 * 
 * This file shows best practices for populating createdBy and updatedBy
 * in your API routes using the audit utilities.
 */

// ============================================================================
// EXAMPLE 1: Simple Create Operation
// ============================================================================
/*
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuditContext, withCreatedBy } from '@/lib/auth/audit'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuditContext() // Get user from session
    const body = await request.json()

    const product = await prisma.product.create({
      data: withCreatedBy(
        {
          name: body.name,
          slug: body.slug,
          description: body.description,
          price: body.price,
        },
        userId // null if not authenticated (system action)
      ),
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
*/

// ============================================================================
// EXAMPLE 2: Update Operation
// ============================================================================
/*
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuditContext, withUpdatedBy } from '@/lib/auth/audit'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await getAuditContext() // Get user from session
    const body = await request.json()

    const product = await prisma.product.update({
      where: { id: params.id },
      data: withUpdatedBy(body, userId), // Adds updatedBy field
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
*/

// ============================================================================
// EXAMPLE 3: Upsert Operation (Create or Update)
// ============================================================================
/*
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuditContext, withAuditFields } from '@/lib/auth/audit'

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { userId } = await getAuditContext() // Get user from session
    const body = await request.json()

    const product = await prisma.product.upsert({
      where: { slug: params.slug },
      update: withAuditFields(body, userId), // Sets both createdBy and updatedBy on update
      create: withAuditFields(
        {
          slug: params.slug,
          ...body,
        },
        userId
      ),
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
*/

// ============================================================================
// EXAMPLE 4: Batch Create Operation
// ============================================================================
/*
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuditContext, withCreatedBy } from '@/lib/auth/audit'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuditContext() // Get user from session
    const { items } = await request.json()

    const results = await prisma.product.createMany({
      data: items.map((item: any) =>
        withCreatedBy(
          {
            name: item.name,
            slug: item.slug,
            price: item.price,
          },
          userId
        )
      ),
    })

    return NextResponse.json(results, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
*/

// ============================================================================
// EXAMPLE 5: Manual Field Population (Alternative Approach)
// ============================================================================
/*
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSessionUserId, getUpdatedByField } from '@/lib/auth/audit'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getSessionUserId() // Get user ID directly
    const body = await request.json()

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...body,
        ...getUpdatedByField(userId), // Adds updatedBy field
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
*/

// ============================================================================
// IMPORTANT NOTES
// ============================================================================
/*
1. AUTHENTICATION:
   - These utilities extract user ID from NextAuth session
   - If user is not authenticated, userId will be null
   - null values are persisted to the database for system actions

2. USAGE PATTERNS:
   - withCreatedBy(): Use in POST (create) endpoints
   - withUpdatedBy(): Use in PATCH/PUT (update) endpoints
   - withAuditFields(): Use in upsert operations
   - getSessionUserId(): Direct access if you need custom logic

3. ERROR HANDLING:
   - getSessionUserId() logs warnings but returns null on error
   - It never throws, so your API continues to work
   - Audit fields are non-blocking - auth failures don't break the API

4. SYSTEM ACTIONS:
   - When userId is null, createdBy/updatedBy are set to null
   - This clearly marks records created/updated by system processes
   - Use for background jobs, scheduled tasks, etc.

5. MIDDLEWARE PROTECTION:
   - Consider adding middleware to require authentication for admin routes
   - See app/middleware.ts for role-based access control examples

6. BEST PRACTICES:
   - Always extract userId early in your handler
   - Use withCreatedBy/withUpdatedBy helpers instead of manual assignment
   - Log audit events for sensitive operations
   - Never override createdBy after initial creation (only updatedBy)
*/

export {} // This file is for documentation only
