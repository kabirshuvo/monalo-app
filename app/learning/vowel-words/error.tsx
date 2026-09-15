'use client'

import Link from 'next/link'
import { vowelTheme } from '@/features/vowel-words/vowel-theme'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'

export default function VowelWordsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={vowelTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-5xl font-black text-violet-600" aria-hidden>
          Aa
        </p>
        <h2 className="text-2xl font-extrabold text-violet-950">Something went wrong</h2>
        <p className="text-sm text-violet-800/85">
          Vowel Words hit a snag. Try again or head back to the hub.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className={vowelTheme.btnPrimary}>
            Try again
          </button>
          <Link href={VOWEL_WORDS_BASE_PATH} className={vowelTheme.btnSecondary}>
            Back to Vowel Words
          </Link>
        </div>
      </div>
    </div>
  )
}
