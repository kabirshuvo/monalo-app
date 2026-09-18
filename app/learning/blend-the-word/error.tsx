'use client'

import Link from 'next/link'
import { blendWordTheme } from '@/features/blend-the-word/blend-word-theme'
import { BLEND_WORD_BASE_PATH } from '@/lib/blend-the-word/constants'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

export default function BlendWordError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={blendWordTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">Something went wrong</h2>
        <p className="text-sm text-[#d6d3d1]">
          Blend the word hit a snag. Try again or head back to Eco Penguin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className={blendWordTheme.btnPrimary}>
            Try again
          </button>
          <Link href={BLEND_WORD_BASE_PATH} className={blendWordTheme.btnSecondary}>
            Try the words
          </Link>
          <Link href={LEARNING_HUB_PATH} className={blendWordTheme.btnSecondary}>
            Eco Penguin
          </Link>
        </div>
      </div>
    </div>
  )
}
