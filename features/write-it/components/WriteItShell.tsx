'use client'

import Link from 'next/link'
import { writeItTheme } from '@/features/write-it/write-it-theme'
import EcoPenguinGuide from '@/features/learning/components/EcoPenguinGuide'
import { WRITE_IT_BASE_PATH } from '@/lib/write-it/constants'
import { CAMBRIDGE_ESL_STAGES, CAMBRIDGE_ROOM_CHIPS } from '@/lib/learning/cambridge-esl'
import { ECO_PENGUIN_APP_NAME, LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'
import { planetFooter } from '@/lib/learning/planet-theme'
import { BUILD_WORD_BASE_PATH } from '@/lib/build-word/session'
import { SIGHT_WORDS_BASE_PATH } from '@/lib/sight-words/constants'

type Props = { children: React.ReactNode; title?: string; backHref?: string }

export default function WriteItShell({
  children,
  title,
  backHref = LEARNING_HUB_PATH,
}: Props) {
  const stage = CAMBRIDGE_ESL_STAGES['stage1-write']
  const chip = CAMBRIDGE_ROOM_CHIPS['write-it'] ?? stage.chip
  return (
    <div className={writeItTheme.shell}>
      <EcoPenguinGuide room="write-it" />
      <header className={writeItTheme.header}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Link href={backHref} className={`${writeItTheme.btnSecondary} px-3 py-2 text-xs sm:text-sm`}>
              ← Back
            </Link>
            <Link
              href={WRITE_IT_BASE_PATH}
              className="truncate text-base font-extrabold text-[#fafaf9] sm:text-lg"
            >
              Write it
            </Link>
          </div>
          <nav className="flex shrink-0 items-center gap-2 text-sm">
            <span className="hidden rounded-full bg-rose-400/20 px-2.5 py-1 text-xs font-bold text-rose-200 sm:inline">
              {chip}
            </span>
            <Link href={LEARNING_HUB_PATH} className="font-semibold text-rose-300 hover:underline">
              {ECO_PENGUIN_APP_NAME}
            </Link>
          </nav>
        </div>
        {title && (
          <div className="border-t border-[#fafaf9]/15 bg-rose-950/40 px-4 py-3 text-center">
            <h1 className="text-lg font-extrabold text-[#fafaf9] sm:text-xl">{title}</h1>
            <p className="mt-1 text-xs text-rose-200/80">{stage.parent}</p>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className={planetFooter}>
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-rose-300">Eco Penguin</p>
            <p className="mt-1 text-sm text-[#d6d3d1]">Build a sentence with tiles — or finger-trace a letter.</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-rose-200">
            <Link href={WRITE_IT_BASE_PATH} className="hover:text-[#fafaf9]">
              Write it
            </Link>
            <Link href={SIGHT_WORDS_BASE_PATH} className="hover:text-[#fafaf9]">
              Sight
            </Link>
            <Link href={BUILD_WORD_BASE_PATH} className="hover:text-[#fafaf9]">
              Spell
            </Link>
            <Link href={LEARNING_HUB_PATH} className="hover:text-[#fafaf9]">
              {ECO_PENGUIN_APP_NAME}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
