import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, AuthorizationError } from '@/lib/auth/role'
import { canManageAllPosts } from '@/lib/blog/permissions'

/** List posts for writer/admin dashboard (includes drafts). */
export async function GET() {
  try {
    const session = await requireRole(['ADMIN', 'WRITER'])
    const userId = (session.user as { id?: string }).id
    const role = (session.user as { role?: string }).role

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const where = canManageAllPosts(role)
      ? { deletedAt: null }
      : { deletedAt: null, authorId: userId }

    const posts = await prisma.blog.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        coverImageUrl: true,
        author: { select: { name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ ok: true, posts })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[GET /api/blog/manage]', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
