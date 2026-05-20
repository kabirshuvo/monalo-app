import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, AuthorizationError } from '@/lib/auth/role'
import { withUpdatedBy } from '@/lib/auth/audit'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params
  try {
    const product = await prisma.product.findFirst({
      where: { slug, deletedAt: null, status: 'ACTIVE' },
      include: {
        images: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error('[GET /api/products/[slug]]', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { slug } = await params
  try {
    const session = await requireRole(['ADMIN', 'SELLER'])
    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
    const existing = await prisma.product.findFirst({
      where: { slug, deletedAt: null },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.name !== undefined) data.name = String(body.name).trim()
    if (body.description !== undefined) data.description = body.description ? String(body.description) : null
    if (body.price !== undefined) {
      const price = Number(body.price)
      if (!Number.isInteger(price) || price < 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
      }
      data.price = price
    }
    if (body.stock !== undefined) data.stock = Number(body.stock)
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl ? String(body.imageUrl) : null
    if (body.status !== undefined) data.status = body.status

    const product = await prisma.product.update({
      where: { id: existing.id },
      data: withUpdatedBy(data, userId),
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[PATCH /api/products/[slug]]', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}
