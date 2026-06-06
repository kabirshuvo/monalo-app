import { auth } from '@/lib/auth-server'
import { notFound, redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'
import BlogPostForm from '@/components/blog/BlogPostForm'
import { prisma } from '@/lib/db'
import { canEditPost } from '@/lib/blog/permissions'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const post = await prisma.blog.findFirst({ where: { id, deletedAt: null } })
  return { title: post ? `Edit: ${post.title}` : 'Edit article' }
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role
  const userId = (session.user as { id?: string }).id
  if (role !== 'WRITER' && role !== 'ADMIN') redirect('/dashboard')

  const post = await prisma.blog.findFirst({
    where: { id, deletedAt: null },
  })

  if (!post || !canEditPost(role, userId, post)) notFound()

  return (
    <DashboardLayout
      userRole={(role as 'WRITER' | 'ADMIN') || 'WRITER'}
      userName={session.user.name || 'Writer'}
      currentPath="/dashboard/articles"
    >
      <BlogPostForm
        mode="edit"
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          content: post.content,
          metaTitle: post.metaTitle ?? '',
          metaDescription: post.metaDescription ?? '',
          coverImageUrl: post.coverImageUrl ?? '',
          status: post.status,
        }}
      />
    </DashboardLayout>
  )
}
