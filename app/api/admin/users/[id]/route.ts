import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { ADMIN_ASSIGNABLE_ROLES } from '@/lib/auth/role-application-options'
import type { Role } from '@prisma/client'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminId = (session.user as { id?: string }).id
    const adminRole = (session.user as { role?: Role }).role
    if (adminRole !== 'ADMIN' || !adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()
    const nextRole = body.role as Role

    if (!nextRole || !(ADMIN_ASSIGNABLE_ROLES as readonly string[]).includes(nextRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    })

    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (target.id === adminId && nextRole !== 'ADMIN') {
      return NextResponse.json({ error: 'You cannot remove your own admin access' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: nextRole },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ ok: true, user })
  } catch (error) {
    console.error('[PATCH /api/admin/users/[id]]', error)
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
  }
}
