'use client'

import Link from 'next/link'
import { whichSoundTheme } from '@/features/which-sound/which-sound-theme'
import { WHICH_SOUND_BASE_PATH } from '@/lib/which-sound/constants'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

export default function WhichSoundError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={whichSoundTheme.shell}>
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">Something went wrong</h2>
        <p className="text-sm text-[#d6d3d1]">
          Which sound? hit a snag. Try again or head back to Eco Penguin.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button type="button" onClick={reset} className={whichSoundTheme.btnPrimary}>
            Try again
          </button>
          <Link href={WHICH_SOUND_BASE_PATH} className={whichSoundTheme.btnSecondary}>
            Try which sound?
          </Link>
          <Link href={LEARNING_HUB_PATH} className={whichSoundTheme.btnSecondary}>
            Eco Penguin
          </Link>
        </div>
      </div>
    </div>
  )
}
