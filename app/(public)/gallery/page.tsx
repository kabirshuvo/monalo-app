import PublicLayout from '@/components/layouts/PublicLayout'
import ArtworkCard, { type ArtworkListItem } from '@/components/gallery/ArtworkCard'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { prisma } from '@/lib/db'

export const metadata = {
  title: 'Gallery - Monalo School',
  description: 'Original art for sale — proceeds support Monalo School',
}

export default async function GalleryPage() {
  const rows = await prisma.artwork.findMany({
    where: { deletedAt: null, status: 'ACTIVE' },
    include: {
      artist: {
        select: {
          name: true,
          artistProfile: { select: { displayName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const artworks: ArtworkListItem[] = rows

  return (
    <PublicLayout currentPath="/gallery">
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold text-blue-600">Gallery</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Art that funds the school</h1>
          <p className="text-gray-600 mt-3">
            Original works from Monalo students and community artists. Each sale supports programs,
            materials, and learning spaces.
          </p>
        </div>

        {artworks.length === 0 ? (
          <div className="space-y-8">
            <EmptyState
              variant="blog"
              title="Gallery opening soon"
              description="Artists are preparing the first collection. Visit the craft shop or courses meanwhile."
            />
            <div className="flex justify-center gap-4">
              <Link href="/shop"><Button variant="secondary">Craft shop</Button></Link>
              <Link href="/courses"><Button>Courses</Button></Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  )
}
