'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { digraphTheme } from '@/features/digraphs/digraph-theme'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'
import {
  readDigraphsSession,
  type DigraphsSession,
} from '@/lib/digraphs/session'
import type { DigraphMeta } from '@/lib/digraphs/types'

export type DigraphProgress = {
  id: string
  label: string
  total: number
  mastered: number
}

type Props = {
  digraphs: DigraphMeta[]
  progress?: DigraphProgress[]
}

export default function DigraphsHub({ digraphs, progress = [] }: Props) {
  const [session, setSession] = useState<DigraphsSession | null>(null)

  useEffect(() => {
    setSession(readDigraphsSession())
  }, [])

  const progressById = useMemo(() => {
    const map = new Map<string, DigraphProgress>()
    for (const row of progress) map.set(row.id, row)
    return map
  }, [progress])

  const continueDigraph = session
    ? digraphs.find((d) => d.id === session.digraphId)
    : null
  const continueHref = session
    ? `${DIGRAPHS_BASE_PATH}/${session.digraphId}?page=${session.page}&mode=${session.mode}`
    : DIGRAPHS_BASE_PATH

  return (
    <div className="space-y-8">
      <section className={`${digraphTheme.card} relative overflow-hidden p-6 text-center sm:p-8`}>
        <p className="text-5xl font-black tracking-tight text-amber-600" aria-hidden>
          sh ch th wh
        </p>
        <h2 className="mt-3 text-2xl font-extrabold text-amber-950 sm:text-3xl">
          Digraphs Practice
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-amber-900/80 sm:text-base">
          Hear the letter team, learn the words, then pick the matching picture.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className={`${digraphTheme.pill} bg-amber-100 text-amber-900`}>👂 Listen</span>
          <span className={`${digraphTheme.pill} bg-orange-100 text-orange-900`}>🔤 See</span>
          <span className={`${digraphTheme.pill} bg-yellow-100 text-yellow-900`}>🎯 Play</span>
        </div>
      </section>

      {continueDigraph && session && (
        <section
          className={`${digraphTheme.card} flex flex-col items-center gap-4 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 sm:flex-row sm:justify-between sm:p-6`}
        >
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Continue</p>
            <h3 className="mt-1 text-xl font-extrabold text-amber-950">
              Keep going with {continueDigraph.label}
            </h3>
            <p className="mt-1 text-sm text-amber-800/80">
              Page {session.page} · {session.mode === 'play' ? 'Listening game' : 'Learn mode'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href={continueHref} className={`${digraphTheme.btnPrimary} px-6 py-3`}>
              Continue {continueDigraph.letter} →
            </Link>
            <Link href="#digraphs" className={digraphTheme.btnSecondary}>
              Pick another digraph
            </Link>
          </div>
        </section>
      )}

      <div id="digraphs">
        <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-amber-700/80">
          Choose a digraph
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {digraphs.map((digraph) => {
            const stats = progressById.get(digraph.id)
            const mastered = stats?.mastered ?? 0
            const total = stats?.total ?? 0
            return (
              <Link
                key={digraph.id}
                href={`${DIGRAPHS_BASE_PATH}/${digraph.id}`}
                className={`${digraphTheme.cardSoft} group p-4 text-center transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg`}
              >
                <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-3xl shadow-md transition group-hover:scale-105">
                  <Image
                    src={digraph.image}
                    alt={digraph.letter}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                </div>
                <p className="mt-3 text-sm font-extrabold text-amber-950 sm:text-base">
                  {digraph.label}
                </p>
                <p className="mt-0.5 text-xs font-medium text-amber-700/75">
                  as in {digraph.example}
                </p>
                {total > 0 && (
                  <p className="mt-2 text-xs font-bold text-orange-700">
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
