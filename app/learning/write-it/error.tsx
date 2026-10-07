'use client'

import Link from 'next/link'
import { writeItTheme } from '@/features/write-it/write-it-theme'
import { WRITE_IT_BASE_PATH } from '@/lib/write-it/constants'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

export default function WriteItError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={writeItTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">Something went wrong</h2>
        <p className="text-sm text-[#d6d3d1]">
          Write it hit a snag. Try again or head back to Eco Penguin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className={writeItTheme.btnPrimary}>
            Try again
          </button>
          <Link href={WRITE_IT_BASE_PATH} className={writeItTheme.btnSecondary}>
            Try Write it
          </Link>
          <Link href={LEARNING_HUB_PATH} className={writeItTheme.btnSecondary}>
            Eco Penguin
          </Link>
        </div>
      </div>
    </div>
  )
}
