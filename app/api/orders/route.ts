import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import { prisma } from '@/lib/db'
import { withCreatedBy } from '@/lib/auth/audit'
import { Role } from '@prisma/client'

type OrderItemInput = { productId: string; quantity: number }

export async function GET() {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    const role = (session.user as { role?: Role }).role

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const where =
      role === 'ADMIN'
        ? { deletedAt: null }
        : { userId, deletedAt: null }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ok: true, orders })
  } catch (error) {
    console.error('[GET /api/orders]', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const body = await request.json()
    const items: OrderItemInput[] = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const productIds = items.map((i) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, deletedAt: null, status: 'ACTIVE' },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
    }

    const productMap = new Map(products.map((p) => [p.id, p]))
    let totalAmount = 0
    const lineItems: {
      productId: string
      quantity: number
      priceSnapshot: number
      subtotal: number
    }[] = []

    for (const item of items) {
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1))
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
      }
      if (product.stock < qty) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }
      const subtotal = product.price * qty
      totalAmount += subtotal
      lineItems.push({
        productId: product.id,
        quantity: qty,
        priceSnapshot: product.price,
        subtotal,
      })
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: withCreatedBy(
          {
            userId,
            status: 'PENDING',
            totalAmount,
            paymentStatus: 'UNPAID',
            shippingAddress: body.shippingAddress
              ? String(body.shippingAddress)
              : null,
          },
          userId
        ),
      })

      for (const line of lineItems) {
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: line.productId,
            quantity: line.quantity,
            priceSnapshot: line.priceSnapshot,
            subtotal: line.subtotal,
          },
        })
        await tx.product.update({
          where: { id: line.productId },
          data: { stock: { decrement: line.quantity } },
        })
      }

      return tx.order.findUnique({
        where: { id: created.id },
        include: {
          items: {
            include: { product: { select: { id: true, name: true, slug: true } } },
          },
        },
      })
    })

    return NextResponse.json({ ok: true, order }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/orders]', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
