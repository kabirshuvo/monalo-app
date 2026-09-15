'use client'

import { useState } from 'react'
import Image from 'next/image'
import { emojiForWord } from '@/lib/vowel-words/emoji'

type WordPictureProps = {
  src: string
  word: string
  alt?: string
  className?: string
  sizes?: string
  priority?: boolean
}

/**
 * Shows the word's real image from media; falls back to emoji if the file is missing.
 */
export default function WordPicture({
  src,
  word,
  alt,
  className = '',
  sizes = '160px',
  priority = false,
}: WordPictureProps) {
  const [failed, setFailed] = useState(false)
  const label = alt ?? word

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-violet-50 to-amber-50 text-4xl ${className}`}
        role="img"
        aria-label={label}
      >
        {emojiForWord(word)}
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
