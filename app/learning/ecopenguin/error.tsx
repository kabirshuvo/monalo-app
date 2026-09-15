'use client'

import Link from 'next/link'
import { ecoTheme } from '@/features/ecopenguin/eco-theme'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'
import { ECO_PENGUIN_APP_NAME, LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

export default function EcoPenguinError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={ecoTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-5xl" aria-hidden>
          🐧
        </p>
        <h2 className="text-2xl font-extrabold text-sky-950">Something went wrong</h2>
        <p className="text-sm text-sky-800/85">
          Explore hit a snag. You can try again or head back to {ECO_PENGUIN_APP_NAME}.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className={ecoTheme.btnPrimary}>
            Try again
          </button>
          <Link href={ECO_PENGUIN_BASE_PATH} className={ecoTheme.btnSecondary}>
            Back to Explore
          </Link>
          <Link href={LEARNING_HUB_PATH} className={ecoTheme.btnSecondary}>
            {ECO_PENGUIN_APP_NAME}
          </Link>
        </div>
      </div>
    </div>
  )
}
