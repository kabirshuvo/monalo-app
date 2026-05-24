import { notFound } from 'next/navigation'
import PublicLayout from '@/components/layouts/PublicLayout'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await prisma.blog.findFirst({
    where: { slug, deletedAt: null, status: 'PUBLISHED' },
  })
  if (!post) return { title: 'Post not found' }
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.blog.findFirst({
    where: { slug, deletedAt: null, status: 'PUBLISHED' },
    include: { author: { select: { name: true } } },
  })

  if (!post) notFound()

  const date = (post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <PublicLayout currentPath="/blog">
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-gray-500">
          {date}
          {post.author?.name ? ` · ${post.author.name}` : ''}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 leading-tight">{post.title}</h1>

        <article className="prose prose-neutral mt-8 max-w-none">
          {post.content.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>
      </main>
    </PublicLayout>
  )
}
