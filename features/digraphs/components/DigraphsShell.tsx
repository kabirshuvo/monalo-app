'use client'

import Link from 'next/link'
import { useStopDigraphsAudioOnUnmount } from '@/features/digraphs/hooks/useDigraphsAudio'
import {
  DigraphsUiProvider,
  useDigraphsUi,
} from '@/features/digraphs/context/DigraphsUiContext'
import { digraphTheme } from '@/features/digraphs/digraph-theme'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'
import { ECO_PENGUIN_APP_NAME, LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'

type Props = {
  children: React.ReactNode
  title?: string
  backHref?: string
}

function ShellChrome({ children, title, backHref }: Props) {
  useStopDigraphsAudioOnUnmount()
  const { muted, toggleMute } = useDigraphsUi()

  return (
    <div className={digraphTheme.shell}>
      <header className={digraphTheme.header}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href={backHref ?? LEARNING_HUB_PATH}
              className={`${digraphTheme.btnSecondary} shrink-0 px-3 py-2.5 text-xs sm:text-sm`}
            >
              ← Back
            </Link>
            <Link
              href={DIGRAPHS_BASE_PATH}
              className="flex min-w-0 items-center gap-2 rounded-2xl bg-amber-50 px-2 py-1.5 sm:px-3"
            >
              <span className="text-2xl font-black text-amber-600" aria-hidden>
                sh
              </span>
              <span className="truncate text-base font-extrabold text-amber-950 sm:text-lg">
                Digraphs
              </span>
            </Link>
          </div>
          <nav className="flex shrink-0 items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <button
              type="button"
              onClick={toggleMute}
              className={`${digraphTheme.btnSecondary} min-h-11 min-w-11 px-3 py-2`}
              aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <Link
              href={LEARNING_HUB_PATH}
              className="rounded-xl px-2 py-1.5 font-semibold text-amber-900 hover:bg-amber-50 sm:px-3"
            >
              {ECO_PENGUIN_APP_NAME}
            </Link>
            <Link
              href="/dashboard/learning"
              className="hidden rounded-xl px-2 py-1.5 font-semibold text-amber-900 hover:bg-amber-50 sm:inline sm:px-3"
            >
              Courses
            </Link>
          </nav>
        </div>
        {title && (
          <div className="border-t border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-center">
            <h1 className="text-lg font-extrabold text-amber-950 sm:text-xl">{title}</h1>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}

export default function DigraphsShell(props: Props) {
  return (
    <DigraphsUiProvider>
      <ShellChrome {...props} />
    </DigraphsUiProvider>
  )
}
