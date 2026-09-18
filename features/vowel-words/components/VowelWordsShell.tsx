'use client'

import Link from 'next/link'
import { useStopVowelWordsAudioOnUnmount } from '@/features/vowel-words/hooks/useVowelWordsAudio'
import {
  VowelWordsUiProvider,
  useVowelWordsUi,
} from '@/features/vowel-words/context/VowelWordsUiContext'
import { vowelTheme } from '@/features/vowel-words/vowel-theme'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'
import { ECO_PENGUIN_APP_NAME, LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'
import EcoPenguinGuide from '@/features/learning/components/EcoPenguinGuide'

type Props = {
  children: React.ReactNode
  title?: string
  backHref?: string
}

function ShellChrome({ children, title, backHref }: Props) {
  useStopVowelWordsAudioOnUnmount()
  const { muted, toggleMute } = useVowelWordsUi()

  return (
    <div className={vowelTheme.shell}>
      <EcoPenguinGuide room="vowel-words" />
      <header className={vowelTheme.header}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href={backHref ?? LEARNING_HUB_PATH}
              className={`${vowelTheme.btnSecondary} shrink-0 px-3 py-2.5 text-xs sm:text-sm`}
            >
              ← Back
            </Link>
            <Link
              href={VOWEL_WORDS_BASE_PATH}
              className="flex min-w-0 items-center gap-2 rounded-2xl bg-[#fafaf9]/12 px-2 py-1.5 sm:px-3"
            >
              <span className="text-2xl font-black text-amber-300" aria-hidden>
                Aa
              </span>
              <span className="truncate text-base font-extrabold text-[#fafaf9] sm:text-lg">
                Vowel Words
              </span>
            </Link>
          </div>
          <nav className="flex shrink-0 items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <button
              type="button"
              onClick={toggleMute}
              className={`${vowelTheme.btnSecondary} min-h-11 min-w-11 px-3 py-2`}
              aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <Link
              href={LEARNING_HUB_PATH}
              className="rounded-xl px-2 py-1.5 font-semibold text-amber-200 hover:bg-[#292524] sm:px-3"
            >
              {ECO_PENGUIN_APP_NAME}
            </Link>
            <Link
              href="/dashboard/learning"
              className="hidden rounded-xl px-2 py-1.5 font-semibold text-amber-200 hover:bg-[#292524] sm:inline sm:px-3"
            >
              Courses
            </Link>
          </nav>
        </div>
        {title && (
          <div className="border-t border-[#fafaf9]/15 bg-amber-950/30 px-4 py-3 text-center">
            <h1 className="text-lg font-extrabold text-[#fafaf9] sm:text-xl">{title}</h1>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}

export default function VowelWordsShell(props: Props) {
  return (
    <VowelWordsUiProvider>
      <ShellChrome {...props} />
    </VowelWordsUiProvider>
  )
}
