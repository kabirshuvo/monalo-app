import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params
  try {
    const post = await prisma.blog.findFirst({
      where: { slug, deletedAt: null, status: 'PUBLISHED' },
      include: {
        author: { select: { name: true, email: true } },
      },
    })
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    console.error('[GET /api/blog/[slug]]', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
