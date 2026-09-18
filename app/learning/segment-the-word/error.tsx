'use client'

import Link from 'next/link'
import { segmentWordTheme } from '@/features/segment-the-word/segment-word-theme'
import { SEGMENT_WORD_BASE_PATH } from '@/lib/segment-the-word/constants'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

export default function SegmentWordError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={segmentWordTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">Something went wrong</h2>
        <p className="text-sm text-[#d6d3d1]">
          Segment the word hit a snag. Try again or head back to Eco Penguin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className={segmentWordTheme.btnPrimary}>
            Try again
          </button>
          <Link href={SEGMENT_WORD_BASE_PATH} className={segmentWordTheme.btnSecondary}>
            Try segmenting
          </Link>
          <Link href={LEARNING_HUB_PATH} className={segmentWordTheme.btnSecondary}>
            Eco Penguin
          </Link>
        </div>
      </div>
    </div>
  )
}
