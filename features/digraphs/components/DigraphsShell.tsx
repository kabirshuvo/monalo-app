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
import EcoPenguinGuide from '@/features/learning/components/EcoPenguinGuide'
import { planetFooter } from '@/lib/learning/planet-theme'
import { LETTER_SOUNDS_BASE_PATH } from '@/lib/letter-sounds/constants'
import { BALLOON_LETTERS_BASE_PATH } from '@/lib/balloon-letters/constants'

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
      <EcoPenguinGuide room="digraphs" />
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
              className="flex min-w-0 items-center gap-2 rounded-2xl bg-[#fafaf9]/12 px-2 py-1.5 sm:px-3"
            >
              <span className="text-2xl font-black text-orange-300" aria-hidden>
                sh
              </span>
              <span className="truncate text-base font-extrabold text-[#fafaf9] sm:text-lg">
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
              className="rounded-xl px-2 py-1.5 font-semibold text-orange-200 hover:bg-[#292524] sm:px-3"
            >
              {ECO_PENGUIN_APP_NAME}
            </Link>
            <Link
              href="/dashboard/learning"
              className="hidden rounded-xl px-2 py-1.5 font-semibold text-orange-200 hover:bg-[#292524] sm:inline sm:px-3"
            >
              Courses
            </Link>
          </nav>
        </div>
        {title && (
          <div className="border-t border-[#fafaf9]/15 bg-orange-950/30 px-4 py-3 text-center">
            <h1 className="text-lg font-extrabold text-[#fafaf9] sm:text-xl">{title}</h1>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className={planetFooter}>
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-300">Eco Penguin</p>
            <p className="mt-1 text-sm text-[#d6d3d1]">Team letters — sh, ch, th, wh.</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-orange-200">
            <Link href={DIGRAPHS_BASE_PATH} className="hover:text-[#fafaf9]">
              Digraphs
            </Link>
            <Link href={LETTER_SOUNDS_BASE_PATH} className="hover:text-[#fafaf9]">
              Sounds
            </Link>
            <Link href={BALLOON_LETTERS_BASE_PATH} className="hover:text-[#fafaf9]">
              Balloons
            </Link>
            <Link href={LEARNING_HUB_PATH} className="hover:text-[#fafaf9]">
              {ECO_PENGUIN_APP_NAME}
            </Link>
            <Link href="/dashboard/learning" className="hover:text-[#fafaf9]">
              Courses
            </Link>
          </nav>
        </div>
      </footer>
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
