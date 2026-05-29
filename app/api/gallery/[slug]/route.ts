import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { requireRole, AuthorizationError } from '@/lib/auth/role'
import { withUpdatedBy } from '@/lib/auth/audit'
import type { ArtworkStatus } from '@prisma/client'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params
  try {
    const artwork = await prisma.artwork.findFirst({
      where: { slug, deletedAt: null },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
            artistProfile: true,
          },
        },
      },
    })

    if (!artwork) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (artwork.status !== 'ACTIVE') {
      const session = await auth()
      const role = (session?.user as { role?: string })?.role
      const userId = (session?.user as { id?: string })?.id
      const canView =
        role === 'ADMIN' ||
        (role === 'SELLER' && artwork.artistId === userId)
      if (!canView) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    }

    return NextResponse.json(artwork)
  } catch (error) {
    console.error('[GET /api/gallery/[slug]]', error)
    return NextResponse.json({ error: 'Failed to fetch artwork' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { slug } = await params
  try {
    const session = await requireRole(['ADMIN', 'SELLER'])
    const userId = (session.user as { id?: string }).id
    const role = (session.user as { role?: string }).role
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const existing = await prisma.artwork.findFirst({
      where: { slug, deletedAt: null },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (role !== 'ADMIN' && existing.artistId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.title !== undefined) data.title = String(body.title).trim()
    if (body.description !== undefined) data.description = body.description ? String(body.description) : null
    if (body.price !== undefined) {
      const price = Number(body.price)
      if (!Number.isInteger(price) || price < 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
      }
      data.price = price
    }
    if (body.medium !== undefined) data.medium = body.medium ? String(body.medium) : null
    if (body.dimensions !== undefined) data.dimensions = body.dimensions ? String(body.dimensions) : null
    if (body.year !== undefined) data.year = body.year ? Number(body.year) : null
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl ? String(body.imageUrl) : null

    if (role === 'ADMIN' && body.status !== undefined) {
      data.status = body.status as ArtworkStatus
    } else if (body.submitForReview) {
      data.status = 'PENDING_REVIEW'
    }

    const artwork = await prisma.artwork.update({
      where: { id: existing.id },
      data: withUpdatedBy(data, userId),
    })

    return NextResponse.json(artwork)
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[PATCH /api/gallery/[slug]]', error)
    return NextResponse.json({ error: 'Failed to update artwork' }, { status: 500 })
  }
}
