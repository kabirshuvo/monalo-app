import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, AuthorizationError } from '@/lib/auth/role'
import { withUpdatedBy } from '@/lib/auth/audit'
import { slugify } from '@/lib/format'
import { canEditPost } from '@/lib/blog/permissions'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const session = await requireRole(['ADMIN', 'WRITER'])
    const userId = (session.user as { id?: string }).id
    const role = (session.user as { role?: string }).role

    const post = await prisma.blog.findFirst({
      where: { id, deletedAt: null },
      include: { author: { select: { name: true, email: true } } },
    })

    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!canEditPost(role, userId, post)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ ok: true, post })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[GET /api/blog/manage/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const session = await requireRole(['ADMIN', 'WRITER'])
    const userId = (session.user as { id?: string }).id
    const role = (session.user as { role?: string }).role

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const existing = await prisma.blog.findFirst({ where: { id, deletedAt: null } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (!canEditPost(role, userId, existing)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.title !== undefined) {
      const title = String(body.title).trim()
      if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
      updates.title = title
    }
    if (body.slug !== undefined) {
      updates.slug = String(body.slug).trim() || slugify(String(body.title ?? existing.title))
    }
    if (body.excerpt !== undefined) updates.excerpt = body.excerpt ? String(body.excerpt) : null
    if (body.content !== undefined) updates.content = String(body.content ?? '')
    if (body.metaTitle !== undefined) updates.metaTitle = body.metaTitle ? String(body.metaTitle) : null
    if (body.metaDescription !== undefined) {
      updates.metaDescription = body.metaDescription ? String(body.metaDescription) : null
    }
    if (body.coverImageUrl !== undefined) {
      updates.coverImageUrl = body.coverImageUrl ? String(body.coverImageUrl) : null
    }

    if (body.status === 'PUBLISHED' || body.status === 'DRAFT') {
      updates.status = body.status
      if (body.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
        updates.publishedAt = new Date()
      }
      if (body.status === 'DRAFT') {
        updates.publishedAt = null
      }
    }

    const post = await prisma.blog.update({
      where: { id },
      data: withUpdatedBy(updates, userId),
    })

    return NextResponse.json({ ok: true, post })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[PATCH /api/blog/manage/[id]]', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const session = await requireRole(['ADMIN', 'WRITER'])
    const userId = (session.user as { id?: string }).id
    const role = (session.user as { role?: string }).role

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const existing = await prisma.blog.findFirst({ where: { id, deletedAt: null } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (!canEditPost(role, userId, existing)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.blog.update({
      where: { id },
      data: withUpdatedBy({ deletedAt: new Date(), status: 'DRAFT' }, userId),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[DELETE /api/blog/manage/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
