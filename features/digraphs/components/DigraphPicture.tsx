'use client'

import { useState } from 'react'
import Image from 'next/image'

type DigraphPictureProps = {
  src: string
  word: string
  alt?: string
  className?: string
  sizes?: string
  priority?: boolean
}

/**
 * Shows the word's image; falls back to the first letter if the file is missing.
 */
export default function DigraphPicture({
  src,
  word,
  alt,
  className = '',
  sizes = '160px',
  priority = false,
}: DigraphPictureProps) {
  const [failed, setFailed] = useState(false)
  const label = alt ?? word
  const fallbackLetter = (word.trim().charAt(0) || '?').toUpperCase()

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 text-4xl font-black text-amber-700 ${className}`}
        role="img"
        aria-label={label}
      >
        {fallbackLetter}
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      <Image
        src={src}
        alt={label}
        fill
        className="object-contain object-center p-1.5"
        sizes={sizes}
        priority={priority}
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  )
}
