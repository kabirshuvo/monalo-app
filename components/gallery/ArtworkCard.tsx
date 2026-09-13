"use client"

import Badge from '@/components/ui/Badge'
import { formatPriceCents } from '@/lib/format'
import ArtworkCardLink from '@/components/gallery/ArtworkCardLink'

export type ArtworkListItem = {
  id: string
  slug: string
  title: string
  description: string | null
  price: number
  medium: string | null
  dimensions: string | null
  year: number | null
  imageUrl: string | null
  artist: {
    name: string | null
    artistProfile: { displayName: string | null } | null
  }
}

function artistName(artwork: ArtworkListItem): string {
  return (
    artwork.artist.artistProfile?.displayName ||
    artwork.artist.name ||
    'Monalo artist'
  )
}

export default function ArtworkCard({ artwork }: { artwork: ArtworkListItem }) {
  const { slug, title, description, price, medium, imageUrl } = artwork

  return (
    <ArtworkCardLink
      slug={slug}
      className="gallery-soft-card group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="aspect-[4/5] overflow-hidden bg-gray-50">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="gallery-soft-media h-full w-full object-cover group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-300">
            Artwork image
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="gallery-soft-link text-lg font-semibold text-gray-900 group-hover:text-blue-600">
            {title}
          </h3>
          <span className="shrink-0 text-sm font-bold text-gray-900">{formatPriceCents(price)}</span>
        </div>
        <p className="text-xs text-gray-500">{artistName(artwork)}</p>
        {medium && <Badge size="sm" variant="info">{medium}</Badge>}
        {description && (
          <p className="line-clamp-2 text-sm text-gray-600">{description}</p>
        )}
      </div>
    </ArtworkCardLink>
  )
}
