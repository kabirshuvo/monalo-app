import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { withUpdatedBy } from '@/lib/auth/audit'
import type { OrderStatus, PaymentStatus, Role } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const PAYMENT_STATUSES: PaymentStatus[] = ['UNPAID', 'PAID', 'REFUNDED', 'FAILED']

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  try {
    const session = await auth()
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

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = (session.user as { role?: Role }).role
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const existing = await prisma.order.findFirst({
      where: { id, deletedAt: null },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.status !== undefined) {
      const status = String(body.status) as OrderStatus
      if (!ORDER_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      data.status = status
      if (status === 'PAID' && !existing.paidAt) data.paidAt = new Date()
      if (status === 'SHIPPED' && !existing.shippedAt) data.shippedAt = new Date()
      if (status === 'DELIVERED' && !existing.deliveredAt) data.deliveredAt = new Date()
    }

    if (body.paymentStatus !== undefined) {
      const paymentStatus = String(body.paymentStatus) as PaymentStatus
      if (!PAYMENT_STATUSES.includes(paymentStatus)) {
        return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
      }
      data.paymentStatus = paymentStatus
    }

    if (body.trackingNumber !== undefined) {
      data.trackingNumber = body.trackingNumber ? String(body.trackingNumber) : null
    }

    if (body.shippingStatus !== undefined) {
      data.shippingStatus = body.shippingStatus ? String(body.shippingStatus) : null
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: existing.id },
      data: withUpdatedBy(data, userId),
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            product: { select: { id: true, name: true, slug: true } },
            artwork: { select: { id: true, title: true, slug: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ ok: true, order })
  } catch (error) {
    console.error('[PATCH /api/orders/[id]]', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
