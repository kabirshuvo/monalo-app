import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { isAppliableRole } from '@/lib/auth/role-application-options'
import type { Role, RoleApplicationStatus } from '@prisma/client'

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
    const status = body.status as RoleApplicationStatus

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return NextResponse.json({ error: 'Status must be APPROVED or REJECTED' }, { status: 400 })
    }

    const application = await prisma.roleApplication.findUnique({
      where: { id },
      include: { user: { select: { id: true, role: true } } },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json({ error: 'Application already reviewed' }, { status: 409 })
    }

    const adminNote =
      typeof body.adminNote === 'string' && body.adminNote.trim()
        ? body.adminNote.trim().slice(0, 2000)
        : null

    let assignedRole: Role | null = null
    if (status === 'APPROVED') {
      const requested = body.assignedRole as string | undefined
      if (!requested || !isAppliableRole(requested)) {
        return NextResponse.json(
          { error: 'Choose a role from the applicant’s requested roles' },
          { status: 400 }
        )
      }
      if (!application.requestedRoles.includes(requested)) {
        return NextResponse.json(
          { error: 'Assigned role must be one of the requested roles' },
          { status: 400 }
        )
      }
      assignedRole = requested
    }

    const updated = await prisma.$transaction(async (tx) => {
      const saved = await tx.roleApplication.update({
        where: { id },
        data: {
          status,
          assignedRole,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          adminNote,
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      })

      if (status === 'APPROVED' && assignedRole) {
        await tx.user.update({
          where: { id: application.userId },
          data: { role: assignedRole },
        })
      }

      return saved
    })

    return NextResponse.json({ ok: true, application: updated })
  } catch (error) {
    console.error('[PATCH /api/role-applications/[id]]', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}
