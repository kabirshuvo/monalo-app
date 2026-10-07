'use client'

import Link from 'next/link'
import { consonantBlendsTheme } from '@/features/consonant-blends/consonant-blends-theme'
import EcoPenguinGuide from '@/features/learning/components/EcoPenguinGuide'
import { CONSONANT_BLENDS_BASE_PATH } from '@/lib/consonant-blends/constants'
import { CAMBRIDGE_ESL_STAGES, CAMBRIDGE_ROOM_CHIPS } from '@/lib/learning/cambridge-esl'
import { ECO_PENGUIN_APP_NAME, LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'
import { planetFooter } from '@/lib/learning/planet-theme'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'

type Props = { children: React.ReactNode; title?: string; backHref?: string }

export default function ConsonantBlendsShell({
  children,
  title,
  backHref = LEARNING_HUB_PATH,
}: Props) {
  const stage = CAMBRIDGE_ESL_STAGES['stage1-phonics']
  const chip = CAMBRIDGE_ROOM_CHIPS['consonant-blends'] ?? stage.chip
  return (
    <div className={consonantBlendsTheme.shell}>
      <EcoPenguinGuide room="consonant-blends" />
      <header className={consonantBlendsTheme.header}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={backHref}
              className={`${consonantBlendsTheme.btnSecondary} px-3 py-2 text-xs sm:text-sm`}
            >
              ← Back
            </Link>
            <Link
              href={CONSONANT_BLENDS_BASE_PATH}
              className="truncate text-base font-extrabold text-[#fafaf9] sm:text-lg"
            >
              Consonant blends
            </Link>
          </div>
          <nav className="flex shrink-0 items-center gap-2 text-sm">
            <span className="hidden rounded-full bg-orange-400/20 px-2.5 py-1 text-xs font-bold text-orange-200 sm:inline">
              {chip}
            </span>
            <Link href={LEARNING_HUB_PATH} className="font-semibold text-orange-300 hover:underline">
              {ECO_PENGUIN_APP_NAME}
            </Link>
          </nav>
        </div>
        {title && (
          <div className="border-t border-[#fafaf9]/15 bg-orange-950/40 px-4 py-3 text-center">
            <h1 className="text-lg font-extrabold text-[#fafaf9] sm:text-xl">{title}</h1>
            <p className="mt-1 text-xs text-orange-200/80">{stage.parent}</p>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className={planetFooter}>
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-300">Eco Penguin</p>
            <p className="mt-1 text-sm text-[#d6d3d1]">Hear st, fr, nd — tap the matching picture.</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-orange-200">
            <Link href={CONSONANT_BLENDS_BASE_PATH} className="hover:text-[#fafaf9]">
              Blends
            </Link>
            <Link href={DIGRAPHS_BASE_PATH} className="hover:text-[#fafaf9]">
              Digraphs
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
