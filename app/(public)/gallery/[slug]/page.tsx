import Link from 'next/link'
import { notFound } from 'next/navigation'
import PublicLayout from '@/components/layouts/PublicLayout'
import { prisma } from '@/lib/db'
import { formatPriceCents } from '@/lib/format'
import { isArtworkPurchasable } from '@/lib/gallery'
import ArtworkPurchaseClient from './ArtworkPurchaseClient'
import Badge from '@/components/ui/Badge'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const artwork = await prisma.artwork.findFirst({
    where: { slug, deletedAt: null, status: 'ACTIVE' },
  })
  if (!artwork) return { title: 'Artwork not found' }
  return {
    title: `${artwork.title} - Monalo Gallery`,
    description: artwork.description ?? undefined,
  }
}

export default async function ArtworkDetailPage({ params }: Props) {
  const { slug } = await params
  const artwork = await prisma.artwork.findFirst({
    where: { slug, deletedAt: null, status: 'ACTIVE' },
    include: {
      artist: {
        select: {
          name: true,
          artistProfile: { select: { displayName: true, bio: true } },
        },
      },
    },
  })

  if (!artwork) notFound()

  const artistLabel =
    artwork.artist.artistProfile?.displayName || artwork.artist.name || 'Monalo artist'

  return (
    <PublicLayout currentPath="/gallery">
      <main className="mx-auto max-w-5xl px-4 py-12">
        <a href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">
          ← Back to gallery
        </a>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] rounded-xl bg-gray-50 overflow-hidden">
            {artwork.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image provided
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500">{artistLabel}</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{artwork.title}</h1>
              <p className="text-2xl font-semibold text-gray-800 mt-3">
                {formatPriceCents(artwork.price)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {artwork.medium && <Badge variant="info">{artwork.medium}</Badge>}
              {artwork.dimensions && <Badge variant="default">{artwork.dimensions}</Badge>}
              {artwork.year && <Badge variant="default">{artwork.year}</Badge>}
            </div>

            {artwork.description && (
              <p className="text-gray-600 leading-relaxed">{artwork.description}</p>
            )}

            {artwork.artist.artistProfile?.bio && (
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
                <p className="text-sm font-medium text-gray-900">About the artist</p>
                <p className="text-sm text-gray-600 mt-1">{artwork.artist.artistProfile.bio}</p>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Proceeds support Monalo School programs. One-of-a-kind — available until sold.
            </p>

            {isArtworkPurchasable(artwork.status) ? (
              <ArtworkPurchaseClient slug={artwork.slug} title={artwork.title} />
            ) : (
              <p className="text-amber-800 font-medium">This piece is no longer available.</p>
            )}
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}
