import PublicLayout from '@/components/layouts/PublicLayout'
import PostCard, { type Post } from '@/components/blog/PostCard'
import EmptyState from '@/components/ui/EmptyState'
import { prisma } from '@/lib/db'

export const metadata = {
  title: 'Blog - Monalo School',
  description: 'Articles on learning, craft, and building Monalo School',
}

function readingTime(text: string): string {
  const words = text.split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

export default async function BlogPage() {
  const rows = await prisma.blog.findMany({
    where: { deletedAt: null, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
  })

  const posts: Post[] = rows.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || p.content.slice(0, 160) + '…',
    date: (p.publishedAt || p.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    readingTime: readingTime(p.content),
  }))

  return (
    <PublicLayout currentPath="/blog">
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10 space-y-3">
          <p className="text-sm font-semibold text-blue-600">Blog</p>
          <h1 className="text-3xl font-bold text-gray-900">Notes on learning and craft</h1>
          <p className="text-gray-600 max-w-3xl">
            Stories and guides that support Monalo School — and help more people find us online.
          </p>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            variant="blog"
            title="No posts yet"
            description="Writers are preparing the first essays. Check back soon."
          />
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  )
}
