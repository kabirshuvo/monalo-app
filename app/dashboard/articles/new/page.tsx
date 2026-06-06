import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'
import BlogPostForm from '@/components/blog/BlogPostForm'

export const metadata = {
  title: 'New article - MonAlo',
}

export default async function NewArticlePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role
  if (role !== 'WRITER' && role !== 'ADMIN') redirect('/dashboard')

  return (
    <DashboardLayout
      userRole={(role as 'WRITER' | 'ADMIN') || 'WRITER'}
      userName={session.user.name || 'Writer'}
      currentPath="/dashboard/articles"
    >
      <BlogPostForm mode="create" />
    </DashboardLayout>
  )
}
