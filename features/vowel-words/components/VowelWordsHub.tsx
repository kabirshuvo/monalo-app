'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { vowelTheme } from '@/features/vowel-words/vowel-theme'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'
import {
  readVowelWordsSession,
  type VowelWordsSession,
} from '@/lib/vowel-words/session'
import type { VowelMeta } from '@/lib/vowel-words/types'

export type VowelProgress = {
  id: string
  label: string
  total: number
  mastered: number
}

type Props = {
  vowels: VowelMeta[]
  progress?: VowelProgress[]
}

export default function VowelWordsHub({ vowels, progress = [] }: Props) {
  const [session, setSession] = useState<VowelWordsSession | null>(null)

  useEffect(() => {
    setSession(readVowelWordsSession())
  }, [])

  const progressById = useMemo(() => {
    const map = new Map<string, VowelProgress>()
    for (const row of progress) map.set(row.id, row)
    return map
  }, [progress])

  const continueVowel = session ? vowels.find((v) => v.id === session.vowelId) : null
  const continueHref = session
    ? `${VOWEL_WORDS_BASE_PATH}/${session.vowelId}?page=${session.page}&mode=${session.mode}`
    : VOWEL_WORDS_BASE_PATH

  return (
    <div className="space-y-8">
      <section className={`${vowelTheme.card} relative overflow-hidden p-6 text-center sm:p-8`}>
        <p className="text-5xl font-black tracking-tight text-violet-600" aria-hidden>
          A E I O U
        </p>
        <h2 className="mt-3 text-2xl font-extrabold text-violet-950 sm:text-3xl">
          Vowel Words Practice
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-violet-900/80 sm:text-base">
          Hear the short vowel sound, learn CVC words, then pick the matching picture.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className={`${vowelTheme.pill} bg-amber-100 text-amber-900`}>👂 Listen</span>
          <span className={`${vowelTheme.pill} bg-violet-100 text-violet-900`}>🔤 See</span>
          <span className={`${vowelTheme.pill} bg-fuchsia-100 text-fuchsia-900`}>🎯 Play</span>
        </div>
      </section>

      {continueVowel && session && (
        <section
          className={`${vowelTheme.card} flex flex-col items-center gap-4 border-violet-200 bg-gradient-to-r from-violet-50 to-amber-50 p-5 sm:flex-row sm:justify-between sm:p-6`}
        >
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Continue</p>
            <h3 className="mt-1 text-xl font-extrabold text-violet-950">
              Keep going with {continueVowel.label}
            </h3>
            <p className="mt-1 text-sm text-violet-800/80">
              Page {session.page} · {session.mode === 'play' ? 'Listening game' : 'Learn mode'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href={continueHref} className={`${vowelTheme.btnPrimary} px-6 py-3`}>
              Continue {continueVowel.letter} →
            </Link>
            <Link href="#vowels" className={vowelTheme.btnSecondary}>
              Pick another vowel
            </Link>
          </div>
        </section>
      )}

      <div id="vowels">
        <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-violet-700/80">
          Choose a short vowel
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {vowels.map((vowel) => {
            const stats = progressById.get(vowel.id)
            const mastered = stats?.mastered ?? 0
            const total = stats?.total ?? 0
            return (
              <Link
                key={vowel.id}
                href={`${VOWEL_WORDS_BASE_PATH}/${vowel.id}`}
                className={`${vowelTheme.cardSoft} group p-4 text-center transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg`}
              >
                <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-3xl shadow-md transition group-hover:scale-105">
                  <Image
                    src={vowel.image}
                    alt={vowel.letter}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                </div>
                <p className="mt-3 text-sm font-extrabold text-violet-950 sm:text-base">
                  {vowel.label}
                </p>
                <p className="mt-0.5 text-xs font-medium text-violet-700/75">
                  as in {vowel.example}
                </p>
                {total > 0 && (
                  <p className="mt-2 text-xs font-bold text-amber-700">
                    ⭐ {mastered} of {total}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
