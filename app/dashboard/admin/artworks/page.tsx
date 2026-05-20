import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { prisma } from '@/lib/db'
import { formatPriceCents } from '@/lib/format'
import { ARTWORK_STATUS_LABELS } from '@/lib/gallery'
import ApproveArtworkButton from './ApproveArtworkButton'
import Badge from '@/components/ui/Badge'

export const metadata = {
  title: 'Review Artworks - MonAlo Admin',
}

export default async function AdminArtworksPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') redirect('/dashboard')

  const pending = await prisma.artwork.findMany({
    where: { deletedAt: null, status: 'PENDING_REVIEW' },
    include: { artist: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  const active = await prisma.artwork.findMany({
    where: { deletedAt: null, status: 'ACTIVE' },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { artist: { select: { name: true } } },
  })

  return (
    <DashboardLayout
      userRole="ADMIN"
      userName={session.user.name || 'Admin'}
      currentPath="/dashboard/admin/artworks"
    >
      <div className="space-y-10">
        <div>
          <Link href="/dashboard/admin" className="text-sm text-blue-600 hover:underline">
            ← Admin dashboard
          </Link>
          <h1 className="text-3xl font-light text-gray-900 mt-4">Gallery review</h1>
          <p className="text-gray-600 mt-2">Approve artworks before they appear in the public gallery.</p>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pending review ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="text-sm text-gray-500">No artworks awaiting approval.</p>
          ) : (
            <ul className="space-y-4">
              {pending.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-600">
                      {a.artist.name} · {formatPriceCents(a.price)}
                      {a.medium ? ` · ${a.medium}` : ''}
                    </p>
                  </div>
                  <ApproveArtworkButton slug={a.slug} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live in gallery</h2>
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {active.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium text-gray-900">{a.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{a.artist.name}</span>
                  <Badge variant="success">{ARTWORK_STATUS_LABELS.ACTIVE}</Badge>
                  <Link href={`/gallery/${a.slug}`} className="text-sm text-blue-600 hover:underline">
                    View
                  </Link>
                </div>
              </li>
            ))}
            {active.length === 0 && (
              <li className="px-4 py-6 text-sm text-gray-500 text-center">No active artworks.</li>
            )}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  )
}
