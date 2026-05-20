import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, AuthorizationError } from '@/lib/auth/role'
import { withCreatedBy } from '@/lib/auth/audit'
import { slugify } from '@/lib/format'

export async function GET() {
  try {
    const posts = await prisma.blog.findMany({
      where: { deletedAt: null, status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        createdAt: true,
        coverImageUrl: true,
      },
      orderBy: { publishedAt: 'desc' },
    })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('[GET /api/blog]', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(['ADMIN', 'WRITER'])
    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
    const body = await request.json()
    const title = String(body.title ?? '').trim()
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const slug = body.slug ? String(body.slug).trim() : slugify(title)
    const status = body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'

    const post = await prisma.blog.create({
      data: withCreatedBy(
        {
          title,
          slug,
          excerpt: body.excerpt ? String(body.excerpt) : null,
          content: String(body.content ?? ''),
          status,
          publishedAt: status === 'PUBLISHED' ? new Date() : null,
          metaTitle: body.metaTitle ? String(body.metaTitle) : null,
          metaDescription: body.metaDescription ? String(body.metaDescription) : null,
          coverImageUrl: body.coverImageUrl ? String(body.coverImageUrl) : null,
          authorId: userId,
        },
        userId
      ),
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('[POST /api/blog]', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
