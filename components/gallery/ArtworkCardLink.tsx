"use client"

import Link from 'next/link'
import { galleryHref } from '@/lib/urls'

/** Client-only link that respects gallery.monalo.school root paths */
export default function ArtworkCardLink({
  slug,
  className,
  children,
}: {
  slug: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link href={galleryHref(slug)} className={className}>
      {children}
    </Link>
  )
}
