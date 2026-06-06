import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import Button from '@/components/ui/Button'
import { prisma } from '@/lib/db'

export const metadata = {
  title: 'Writer Dashboard - MonAlo',
}

export default async function DashboardWriter() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role
  const userId = (session.user as { id?: string }).id
  if (role !== 'WRITER' && role !== 'ADMIN') redirect('/dashboard')

  const stats = await prisma.blog.groupBy({
    by: ['status'],
    where: { deletedAt: null, ...(role === 'ADMIN' ? {} : { authorId: userId }) },
    _count: true,
  })

  const published = stats.find((s) => s.status === 'PUBLISHED')?._count ?? 0
  const drafts = stats.find((s) => s.status === 'DRAFT')?._count ?? 0

  return (
    <DashboardLayout
      userRole={(role as 'WRITER' | 'ADMIN') || 'WRITER'}
      userName={session.user.name || 'Writer'}
      currentPath="/dashboard/writer"
    >
      <div className="space-y-10">
        <div>
          <h1 className="text-4xl font-light text-gray-900">Writer studio</h1>
          <p className="text-gray-600 mt-3 max-w-2xl">
            Publish calm guides for guardians and kids on the MonAlo blog.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Published</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{published}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Drafts</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{drafts}</p>
          </div>
          <div className="rounded-xl border border-purple-100 bg-purple-50 p-5 flex flex-col justify-between">
            <p className="text-sm text-purple-800">Ready to write?</p>
            <Link href="/dashboard/articles/new" className="mt-3">
              <Button variant="primary" size="sm">
                New article
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/articles">
            <Button variant="secondary">Manage all articles</Button>
          </Link>
          <Link href="/blog" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost">View public blog</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
