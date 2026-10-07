export const dynamic = 'force-dynamic'

import PublicLayout from '@/components/layouts/PublicLayout'
import PostCard, { type Post } from '@/components/blog/PostCard'
import EmptyState from '@/components/ui/EmptyState'
import PageHero from '@/components/cosmos/PageHero'
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
      <PageHero
        planet="saturn"
        title="Guides for guardians and kids"
        description="Practical, calm advice for everyday challenges: screen time, homework, sleep, friendships and building confidence at home and school."
      />

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
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
