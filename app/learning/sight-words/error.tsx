'use client'

import Link from 'next/link'
import { sightWordsTheme } from '@/features/sight-words/sight-words-theme'
import { SIGHT_WORDS_BASE_PATH } from '@/lib/sight-words/constants'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

export default function SightWordsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={sightWordsTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">Something went wrong</h2>
        <p className="text-sm text-[#d6d3d1]">
          Sight words hit a snag. Try again or head back to Eco Penguin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className={sightWordsTheme.btnPrimary}>
            Try again
          </button>
          <Link href={SIGHT_WORDS_BASE_PATH} className={sightWordsTheme.btnSecondary}>
            Try sight words
          </Link>
          <Link href={LEARNING_HUB_PATH} className={sightWordsTheme.btnSecondary}>
            Eco Penguin
          </Link>
        </div>
      </div>
    </div>
  )
}
