import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { prisma } from '@/lib/db'
import { formatPriceCents } from '@/lib/format'
import { ARTWORK_STATUS_LABELS } from '@/lib/gallery'
import SellerArtworkForm from './SellerArtworkForm'
import Badge from '@/components/ui/Badge'

export const metadata = {
  title: 'My Artworks - MonAlo',
}

export default async function SellerArtworksPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role
  const userId = (session.user as { id?: string }).id
  if (role !== 'SELLER' && role !== 'ADMIN') redirect('/dashboard')
  if (!userId) redirect('/login')

  const artworks = await prisma.artwork.findMany({
    where: {
      deletedAt: null,
      ...(role === 'ADMIN' ? {} : { artistId: userId }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      artist: { select: { name: true } },
    },
  })

  return (
    <DashboardLayout
      userRole={role === 'ADMIN' ? 'ADMIN' : 'SELLER'}
      userName={session.user.name || 'Seller'}
      currentPath="/dashboard/seller/artworks"
    >
      <div className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Gallery artworks</h1>
            <p className="text-gray-600 mt-2">List pieces for sale on gallery.monalo.school</p>
          </div>
          <Link href="/dashboard/seller" className="text-sm text-blue-600 hover:underline">
            ← Seller dashboard
          </Link>
        </div>

        <SellerArtworkForm />

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                {role === 'ADMIN' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {artworks.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{a.title}</td>
                  {role === 'ADMIN' && (
                    <td className="px-4 py-3 text-sm text-gray-600">{a.artist.name}</td>
                  )}
                  <td className="px-4 py-3 text-sm">{formatPriceCents(a.price)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        a.status === 'ACTIVE'
                          ? 'success'
                          : a.status === 'PENDING_REVIEW'
                            ? 'warning'
                            : 'default'
                      }
                    >
                      {ARTWORK_STATUS_LABELS[a.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {a.status === 'ACTIVE' && (
                      <Link href={`/gallery/${a.slug}`} className="text-sm text-blue-600 hover:underline">
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {artworks.length === 0 && (
            <p className="p-6 text-sm text-gray-500 text-center">No artworks yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
