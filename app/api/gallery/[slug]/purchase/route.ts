import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { withCreatedBy } from '@/lib/auth/audit'
import { isArtworkPurchasable } from '@/lib/gallery'

type Params = { params: Promise<{ slug: string }> }

/**
 * POST /api/gallery/[slug]/purchase — buy artwork (qty 1, marks SOLD)
 */
export async function POST(request: NextRequest, { params }: Params) {
  const { slug } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Sign in to purchase' }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const artwork = await prisma.artwork.findFirst({
      where: { slug, deletedAt: null },
    })

    if (!artwork || !isArtworkPurchasable(artwork.status)) {
      return NextResponse.json({ error: 'Artwork is not available' }, { status: 400 })
    }

    if (artwork.artistId === userId) {
      return NextResponse.json({ error: 'You cannot purchase your own artwork' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const shippingAddress = body.shippingAddress ? String(body.shippingAddress) : null

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: withCreatedBy(
          {
            userId,
            status: 'PENDING',
            totalAmount: artwork.price,
            paymentStatus: 'UNPAID',
            shippingAddress,
          },
          userId
        ),
      })

      await tx.orderItem.create({
        data: {
          orderId: created.id,
          artworkId: artwork.id,
          quantity: 1,
          priceSnapshot: artwork.price,
          subtotal: artwork.price,
        },
      })

      await tx.artwork.update({
        where: { id: artwork.id },
        data: { status: 'SOLD' },
      })

      return tx.order.findUnique({
        where: { id: created.id },
        include: {
          items: {
            include: {
              artwork: { select: { id: true, title: true, slug: true } },
            },
          },
        },
      })
    })

    return NextResponse.json({ ok: true, order }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/gallery/[slug]/purchase]', error)
    return NextResponse.json({ error: 'Failed to purchase artwork' }, { status: 500 })
  }
}
