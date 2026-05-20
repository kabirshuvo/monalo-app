import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, AuthorizationError } from '@/lib/auth/role'
import { withCreatedBy } from '@/lib/auth/audit'
import { slugify } from '@/lib/format'

/**
 * GET /api/gallery — public active artworks
 */
export async function GET() {
  try {
    const artworks = await prisma.artwork.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        medium: true,
        dimensions: true,
        year: true,
        imageUrl: true,
        status: true,
        artist: {
          select: {
            id: true,
            name: true,
            artistProfile: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(artworks)
  } catch (error) {
    console.error('[GET /api/gallery]', error)
    return NextResponse.json({ error: 'Failed to fetch artworks' }, { status: 500 })
  }
}

/**
 * POST /api/gallery — SELLER or ADMIN creates artwork
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(['ADMIN', 'SELLER'])
    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const body = await request.json()
    const title = String(body.title ?? '').trim()
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const price = Number(body.price)
    if (!Number.isInteger(price) || price < 0) {
      return NextResponse.json({ error: 'Price must be integer cents' }, { status: 400 })
    }

    const role = (session.user as { role?: string }).role
    const isAdmin = role === 'ADMIN'
    const slug = body.slug ? String(body.slug).trim() : slugify(title)
    const artistId = isAdmin && body.artistId ? String(body.artistId) : userId

    const status =
      isAdmin && body.status === 'ACTIVE'
        ? 'ACTIVE'
        : body.submitForReview
          ? 'PENDING_REVIEW'
          : 'DRAFT'

    const artwork = await prisma.artwork.create({
      data: withCreatedBy(
        {
          artistId,
          title,
          slug,
          description: body.description ? String(body.description) : null,
          price,
          medium: body.medium ? String(body.medium) : null,
          dimensions: body.dimensions ? String(body.dimensions) : null,
          year: body.year ? Number(body.year) : null,
          imageUrl: body.imageUrl ? String(body.imageUrl) : null,
          status,
        },
        userId
      ),
    })

    return NextResponse.json(artwork, { status: 201 })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[POST /api/gallery]', error)
    return NextResponse.json({ error: 'Failed to create artwork' }, { status: 500 })
  }
}
