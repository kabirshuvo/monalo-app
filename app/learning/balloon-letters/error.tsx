'use client'

import Link from 'next/link'
import { balloonLettersTheme } from '@/features/balloon-letters/balloon-letters-theme'
import { BALLOON_LETTERS_BASE_PATH } from '@/lib/balloon-letters/constants'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

export default function BalloonLettersError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={balloonLettersTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">Something went wrong</h2>
        <p className="text-sm text-[#d6d3d1]">
          Balloon letters hit a snag. Try again or head back to Eco Penguin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className={balloonLettersTheme.btnPrimary}>
            Try again
          </button>
          <Link href={BALLOON_LETTERS_BASE_PATH} className={balloonLettersTheme.btnSecondary}>
            Try the balloons
          </Link>
          <Link href={LEARNING_HUB_PATH} className={balloonLettersTheme.btnSecondary}>
            Eco Penguin
          </Link>
        </div>
      </div>
    </div>
  )
}
