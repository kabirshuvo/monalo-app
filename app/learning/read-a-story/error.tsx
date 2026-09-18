'use client'

import Link from 'next/link'
import { readStoryTheme } from '@/features/read-a-story/read-story-theme'
import { READ_STORY_BASE_PATH } from '@/lib/read-a-story/constants'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

export default function ReadStoryError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={readStoryTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">Something went wrong</h2>
        <p className="text-sm text-[#d6d3d1]">
          Read a story hit a snag. Try again or head back to Eco Penguin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className={readStoryTheme.btnPrimary}>
            Try again
          </button>
          <Link href={READ_STORY_BASE_PATH} className={readStoryTheme.btnSecondary}>
            Try stories
          </Link>
          <Link href={LEARNING_HUB_PATH} className={readStoryTheme.btnSecondary}>
            Eco Penguin
          </Link>
        </div>
      </div>
    </div>
  )
}
