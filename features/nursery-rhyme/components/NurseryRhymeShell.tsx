'use client'

import Link from 'next/link'
import { nurseryRhymeTheme } from '@/features/nursery-rhyme/nursery-rhyme-theme'
import EcoPenguinGuide from '@/features/learning/components/EcoPenguinGuide'
import { NURSERY_RHYME_BASE_PATH } from '@/lib/nursery-rhyme/constants'
import { CAMBRIDGE_ESL_STAGES } from '@/lib/learning/cambridge-esl'
import { ECO_PENGUIN_APP_NAME, LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'
import { planetFooter } from '@/lib/learning/planet-theme'
import { LETTER_SOUNDS_BASE_PATH } from '@/lib/letter-sounds/constants'

type Props = { children: React.ReactNode; title?: string; backHref?: string }

export default function NurseryRhymeShell({
  children,
  title,
  backHref = LEARNING_HUB_PATH,
}: Props) {
  const stage = CAMBRIDGE_ESL_STAGES.nursery
  return (
    <div className={nurseryRhymeTheme.shell}>
      <EcoPenguinGuide room="nursery-rhyme" />
      <header className={nurseryRhymeTheme.header}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Link href={backHref} className={`${nurseryRhymeTheme.btnSecondary} px-3 py-2 text-xs sm:text-sm`}>
              ← Back
            </Link>
            <Link
              href={NURSERY_RHYME_BASE_PATH}
              className="truncate text-base font-extrabold text-[#fafaf9] sm:text-lg"
            >
              Rhyme time
            </Link>
          </div>
          <nav className="flex shrink-0 items-center gap-2 text-sm">
            <span className="hidden rounded-full bg-cyan-400/20 px-2.5 py-1 text-xs font-bold text-cyan-200 sm:inline">
              {stage.chip}
            </span>
            <Link href={LEARNING_HUB_PATH} className="font-semibold text-cyan-300 hover:underline">
              {ECO_PENGUIN_APP_NAME}
            </Link>
          </nav>
        </div>
        {title && (
          <div className="border-t border-[#fafaf9]/15 bg-cyan-950/40 px-4 py-3 text-center">
            <h1 className="text-lg font-extrabold text-[#fafaf9] sm:text-xl">{title}</h1>
            <p className="mt-1 text-xs text-cyan-200/80">{stage.parent}</p>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className={planetFooter}>
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Eco Penguin</p>
            <p className="mt-1 text-sm text-[#d6d3d1]">Tap the two pictures that rhyme.</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-cyan-200">
            <Link href={NURSERY_RHYME_BASE_PATH} className="hover:text-[#fafaf9]">
              Rhyme
            </Link>
            <Link href={LETTER_SOUNDS_BASE_PATH} className="hover:text-[#fafaf9]">
              Sounds
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
