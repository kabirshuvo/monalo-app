import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { prisma } from '@/lib/db'
import {
  fetchReactionCounts,
  fetchUserReaction,
  isValidReactionType,
  toggleUserReaction,
} from '@/lib/blog/reactions-db'

type Params = { params: Promise<{ slug: string }> }

async function getPublishedBlog(slug: string) {
  return prisma.blog.findFirst({
    where: { slug, deletedAt: null, status: 'PUBLISHED' },
    select: { id: true, slug: true, title: true },
  })
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params
  try {
    const post = await getPublishedBlog(slug)
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const session = await auth()
    const userId = session?.user?.id

    const [counts, userReaction] = await Promise.all([
      fetchReactionCounts(post.id),
      userId ? fetchUserReaction(post.id, userId) : Promise.resolve(null),
    ])

    return NextResponse.json({ ok: true, counts, userReaction })
  } catch (error) {
    console.error('[GET /api/blog/[slug]/reactions]', error)
    return NextResponse.json({ error: 'Failed to load reactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { slug } = await params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Sign in to react' }, { status: 401 })
    }

    const post = await getPublishedBlog(slug)
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const rawType = body.type
    const type =
      rawType === null ? null : isValidReactionType(rawType) ? rawType : undefined

    if (type === undefined) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
    }

    const userId = session.user.id
    await toggleUserReaction(post.id, userId, type)

    const [counts, userReaction] = await Promise.all([
      fetchReactionCounts(post.id),
      fetchUserReaction(post.id, userId),
    ])

    return NextResponse.json({ ok: true, counts, userReaction })
  } catch (error) {
    console.error('[POST /api/blog/[slug]/reactions]', error)
    return NextResponse.json({ error: 'Failed to save reaction' }, { status: 500 })
  }
}
