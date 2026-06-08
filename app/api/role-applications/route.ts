import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { APPLIABLE_ROLES, isAppliableRole } from '@/lib/auth/role-application-options'
import type { Role } from '@prisma/client'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    const role = (session.user as { role?: Role }).role
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const applications = await prisma.roleApplication.findMany({
      where: role === 'ADMIN' ? {} : { userId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: role === 'ADMIN' ? 100 : 20,
    })

    return NextResponse.json({ ok: true, applications })
  } catch (error) {
    console.error('[GET /api/role-applications]', error)
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const body = await request.json()
    const rawRoles: unknown[] = Array.isArray(body.roles) ? body.roles : []
    const roles = [...new Set(rawRoles.filter((r): r is Role => typeof r === 'string' && isAppliableRole(r)))]

    if (roles.length === 0) {
      return NextResponse.json(
        { error: `Select at least one role: ${APPLIABLE_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    const pending = await prisma.roleApplication.findFirst({
      where: { userId, status: 'PENDING' },
    })
    if (pending) {
      return NextResponse.json(
        { error: 'You already have a pending application. We will review it soon.' },
        { status: 409 }
      )
    }

    const message =
      typeof body.message === 'string' && body.message.trim() ? body.message.trim().slice(0, 2000) : null

    const application = await prisma.roleApplication.create({
      data: {
        userId,
        requestedRoles: roles,
        message,
      },
    })

    return NextResponse.json({ ok: true, application }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/role-applications]', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
