"use client"

import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { formatPriceCents } from '@/lib/format'

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
    <Link
      href={`/gallery/${slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/5] bg-gray-50 overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 text-sm">
            Artwork image
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">{title}</h3>
          <span className="text-sm font-bold text-gray-900 shrink-0">{formatPriceCents(price)}</span>
        </div>
        <p className="text-xs text-gray-500">{artistName(artwork)}</p>
        {medium && <Badge size="sm" variant="info">{medium}</Badge>}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}
      </div>
    </Link>
  )
}
