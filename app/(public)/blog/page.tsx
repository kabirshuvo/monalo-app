export const dynamic = 'force-dynamic'

import PublicLayout from '@/components/layouts/PublicLayout'
import PostCard, { type Post } from '@/components/blog/PostCard'
import EmptyState from '@/components/ui/EmptyState'
import { prisma } from '@/lib/db'
import { excerptFromContent } from '@/lib/blog/content'
import { blogArticleStats } from '@/lib/blog/stats'
import { blogCategoryForSlug } from '@/lib/blog/categories'

export const metadata = {
  title: 'MonAlo Blog — Guides for guardians & kids',
  description:
    'Calm, practical articles on screen time, homework, sleep, anxiety, and growing together at home and school.',
}

export default async function BlogPage() {
  const rows = await prisma.blog.findMany({
    where: { deletedAt: null, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
  })

  const posts: Post[] = rows.map((p) => {
    const stats = blogArticleStats(p.content)
    return {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || excerptFromContent(p.content),
      date: (p.publishedAt || p.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      readingTime: stats.readLabel,
      pointsLabel: stats.pointsLabel,
      category: blogCategoryForSlug(p.slug),
    }
  })

  return (
    <PublicLayout currentPath="/blog">
      <div className="bg-gradient-to-b from-purple-50/80 to-transparent dark:from-purple-950/30 dark:to-transparent border-b border-gray-200 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">MonAlo Blog</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-light text-gray-900 dark:text-zinc-50">
            Guides for guardians & kids
          </h1>
          <p className="mt-4 text-gray-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            Practical, calm advice for everyday challenges — screen time, homework, sleep, friendships,
            and building confidence at home and school.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-12">
        {posts.length === 0 ? (
          <EmptyState
            variant="blog"
            title="Articles coming soon"
            description="Our writers are preparing the first guides for guardians and kids."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  )
}
