import { notFound } from 'next/navigation'
import Image from 'next/image'
import PublicLayout from '@/components/layouts/PublicLayout'
import ActivityTracker from '@/components/points/ActivityTracker'
import BlogArticleBody from '@/components/blog/BlogArticleBody'
import BlogArticleMeta from '@/components/blog/BlogArticleMeta'
import { prisma } from '@/lib/db'
import { blogArticleStats } from '@/lib/blog/stats'
import { fetchReactionCounts } from '@/lib/blog/reactions-db'
import { blogCategoryForSlug } from '@/lib/blog/categories'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await prisma.blog.findFirst({
    where: { slug, deletedAt: null, status: 'PUBLISHED' },
  })
  if (!post) return { title: 'Article not found' }
  return {
    title: post.metaTitle || `${post.title} | MonAlo Blog`,
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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const category = blogCategoryForSlug(post.slug)
  const stats = blogArticleStats(post.content)
  const reactionCounts = await fetchReactionCounts(post.id)

  return (
    <PublicLayout currentPath="/blog">
      <ActivityTracker type="blog" />
      <main className="mx-auto max-w-3xl px-4 py-12">
        {post.coverImageUrl && (
          <div className="relative mb-8 aspect-[2/1] overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800">
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
              unoptimized={post.coverImageUrl.startsWith('/')}
            />
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-light text-gray-900 dark:text-zinc-50 leading-tight">
          {post.title}
        </h1>

        <div className="mt-6">
          <BlogArticleMeta
            slug={post.slug}
            stats={stats}
            date={date}
            authorName={post.author?.name}
            category={category}
            initialCounts={reactionCounts}
          />
        </div>

        {post.excerpt && (
          <p className="mt-8 text-lg text-gray-600 dark:text-zinc-300 leading-relaxed border-l-4 border-purple-200 dark:border-purple-800 pl-4">
            {post.excerpt}
          </p>
        )}

        <div className="mt-10">
          <BlogArticleBody content={post.content} />
        </div>
      </main>
    </PublicLayout>
  )
}
