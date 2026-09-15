'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { buildWordTheme } from '@/features/build-word/build-word-theme'
import {
  BUILD_WORD_BASE_PATH,
  readBuildWordSession,
} from '@/lib/build-word/session'
import type { VowelMeta } from '@/lib/vowel-words/types'
import { VOWEL_ACCENT } from '@/features/vowel-words/vowel-theme'

type Progress = { id: string; total: number; mastered: number }

type Props = {
  vowels: VowelMeta[]
  progress?: Progress[]
}

export default function BuildWordHub({ vowels, progress = [] }: Props) {
  const [continueHref, setContinueHref] = useState<string | null>(null)
  const [continueLabel, setContinueLabel] = useState('')

  useEffect(() => {
    const s = readBuildWordSession()
    if (s) {
      setContinueHref(`${BUILD_WORD_BASE_PATH}/${s.vowelId}`)
      setContinueLabel(s.vowelLabel)
    }
  }, [])

  const byId = new Map(progress.map((p) => [p.id, p]))

  return (
    <div className="space-y-8">
      <section className={`${buildWordTheme.card} p-6 text-center sm:p-8`}>
        <p className="text-5xl" aria-hidden>
          🔤
        </p>
        <h2 className="mt-3 text-2xl font-extrabold text-sky-950 sm:text-3xl">Build the word</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-sky-800/85 sm:text-base">
          Hear a short-vowel word, then tap letters to spell it. Practice after Vowel Words.
        </p>
      </section>

      {continueHref && (
        <Link
          href={continueHref}
          className={`${buildWordTheme.card} flex flex-col items-center gap-2 border-sky-200 bg-sky-50 p-5 sm:flex-row sm:justify-between`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Continue</p>
            <p className="text-lg font-extrabold text-sky-950">{continueLabel}</p>
          </div>
          <span className={buildWordTheme.btnPrimary}>Keep spelling →</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {vowels.map((v) => {
          const stats = byId.get(v.id)
          const accent = VOWEL_ACCENT[v.id] ?? 'from-sky-400 to-indigo-400'
          return (
            <Link
              key={v.id}
              href={`${BUILD_WORD_BASE_PATH}/${v.id}`}
              className={`${buildWordTheme.cardSoft} p-4 text-center transition hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-3xl font-black text-white`}
              >
                {v.letter}
              </div>
              <p className="mt-2 font-extrabold text-sky-950">{v.label}</p>
              {stats && (
                <p className="mt-1 text-xs font-bold text-amber-700">
                  ⭐ {stats.mastered} of {stats.total}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
