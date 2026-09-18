'use client'

import Link from 'next/link'
import { digraphTheme } from '@/features/digraphs/digraph-theme'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'

export default function DigraphsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={digraphTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-5xl font-black text-orange-300" aria-hidden>
          sh
        </p>
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">Something went wrong</h2>
        <p className="text-sm text-[#d6d3d1]">
          Digraphs hit a snag. Try again or head back to the hub.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className={digraphTheme.btnPrimary}>
            Try again
          </button>
          <Link href={DIGRAPHS_BASE_PATH} className={digraphTheme.btnSecondary}>
            Back to Digraphs
          </Link>
        </div>
      </div>
    </div>
  )
}
