import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import ArticleListActions from '@/components/blog/ArticleListActions'
import { prisma } from '@/lib/db'
import { canManageAllPosts } from '@/lib/blog/permissions'

export const metadata = {
  title: 'Articles - MonAlo Dashboard',
  description: 'Write, edit, and publish blog posts for guardians and kids',
}

export default async function ArticlesDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role
  const userId = (session.user as { id?: string }).id
  if (role !== 'WRITER' && role !== 'ADMIN') redirect('/dashboard')

  const isAdmin = canManageAllPosts(role)
  const where = isAdmin ? { deletedAt: null } : { deletedAt: null, authorId: userId }

  const posts = await prisma.blog.findMany({
    where,
    include: { author: { select: { name: true, email: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  const published = posts.filter((p) => p.status === 'PUBLISHED').length
  const drafts = posts.filter((p) => p.status === 'DRAFT').length

  return (
    <DashboardLayout
      userRole={(role as 'WRITER' | 'ADMIN') || 'WRITER'}
      userName={session.user.name || 'Writer'}
      currentPath="/dashboard/articles"
    >
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Articles</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Calm, practical guides for guardians and kids — published on{' '}
              <span className="font-medium">blog.monalo.school</span>.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {published} published · {drafts} drafts
              {isAdmin ? ' · viewing all writers' : ''}
            </p>
          </div>
          <Link href="/dashboard/articles/new">
            <Button variant="primary">New article</Button>
          </Link>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            variant="blog"
            title="No articles yet"
            description="Start with a draft for guardians — screen time, homework, sleep, and more."
            actionLabel="Write your first article"
            actionHref="/dashboard/articles/new"
          />
        ) : (
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white overflow-hidden">
            {posts.map((post) => (
              <li key={post.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{post.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Updated{' '}
                    {post.updatedAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {post.publishedAt && post.status === 'PUBLISHED'
                      ? ` · Live since ${post.publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : ''}
                  </p>
                </div>
                <ArticleListActions
                  isAdmin={isAdmin}
                  post={{
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    status: post.status,
                    publishedAt: post.publishedAt?.toISOString() ?? null,
                    updatedAt: post.updatedAt.toISOString(),
                    author: post.author,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  )
}
