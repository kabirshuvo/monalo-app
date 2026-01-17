import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'

/**
 * GET /api/profile
 * Returns current user's profile (excludes password and sensitive fields)
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock profile data
    // In production: fetch from Prisma excluding password
    const profile = {
      id: (session.user as any).id || 'demo-user',
      name: session.user.name || null,
      email: session.user.email || null,
      avatar: session.user.image || null,
      phone: null,
      role: (session.user as any).role || 'CUSTOMER',
      level: (session.user as any).level || 1,
      badge: 'New Light',
      points: 0,
      isVerified: true,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ ok: true, profile })
  } catch (error) {
    console.error('[GET /api/profile]', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

/**
 * PATCH /api/profile
 * Updates user profile (allowed fields: name, avatar, phone)
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    
    // Validate allowed fields
    const allowedFields = ['name', 'avatar', 'phone']
    const updates: Record<string, any> = {}
    
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    // Normalize phone if provided: keep digits and optional leading +
    if (updates.phone) {
      updates.phone = String(updates.phone).trim().replace(/(?!^\+)\D/g, '')
    }

    // Mock update response
    // In production: update via Prisma
    const updatedProfile = {
      id: (session.user as any).id || 'demo-user',
      name: updates.name ?? session.user.name,
      email: session.user.email,
      avatar: updates.avatar ?? session.user.image,
      phone: updates.phone ?? null,
      role: (session.user as any).role || 'CUSTOMER',
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ ok: true, profile: updatedProfile })
  } catch (error) {
    console.error('[PATCH /api/profile]', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
