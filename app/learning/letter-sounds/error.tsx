'use client'

import Link from 'next/link'
import { letterSoundsTheme } from '@/features/letter-sounds/letter-sounds-theme'
import { LETTER_SOUNDS_BASE_PATH } from '@/lib/letter-sounds/constants'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

export default function LetterSoundsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={letterSoundsTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-emerald-950">Something went wrong</h2>
        <p className="text-sm text-emerald-800/85">
          Letter sounds hit a snag. Try again or head back to Eco Penguin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className={letterSoundsTheme.btnPrimary}>
            Try again
          </button>
          <Link href={LETTER_SOUNDS_BASE_PATH} className={letterSoundsTheme.btnSecondary}>
            Try the letters
          </Link>
          <Link href={LEARNING_HUB_PATH} className={letterSoundsTheme.btnSecondary}>
            Eco Penguin
          </Link>
        </div>
      </div>
    </div>
  )
}
