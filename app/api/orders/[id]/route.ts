import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import { prisma } from '@/lib/db'
import { Role } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    const role = (session.user as { role?: Role }).role

    const order = await prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    }

    if (role !== 'ADMIN' && order.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ ok: true, order })
  } catch (error) {
    console.error('[GET /api/orders/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
