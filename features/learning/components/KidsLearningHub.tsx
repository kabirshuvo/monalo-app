'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { readEcoPenguinSession } from '@/lib/ecopenguin/session'
import { readVowelWordsSession } from '@/lib/vowel-words/session'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'
import type { LearningGameCard } from '@/lib/learning/kids-hub'

const DIGRAPHS_BASE = '/learning/digraphs'
const BUILD_WORD_BASE = '/learning/build-the-word'

type ContinueItem = {
  id: string
  label: string
  detail: string
  href: string
}

type Props = {
  games: LearningGameCard[]
}

export default function KidsLearningHub({ games }: Props) {
  const [continues, setContinues] = useState<ContinueItem[]>([])

  useEffect(() => {
    const items: ContinueItem[] = []
    const eco = readEcoPenguinSession()
    if (eco) {
      items.push({
        id: 'eco',
        label: `Eco Penguin · ${eco.categoryName}`,
        detail: `Page ${eco.page} · ${eco.mode === 'play' ? 'Play' : 'Learn'}`,
        href: `${ECO_PENGUIN_BASE_PATH}/categories/${eco.categorySlug}?page=${eco.page}&mode=${eco.mode}`,
      })
    }
    const vowels = readVowelWordsSession()
    if (vowels) {
      items.push({
        id: 'vowels',
        label: `Vowel Words · ${vowels.vowelLabel}`,
        detail: `Page ${vowels.page} · ${vowels.mode === 'play' ? 'Play' : 'Learn'}`,
        href: `${VOWEL_WORDS_BASE_PATH}/${vowels.vowelId}?page=${vowels.page}&mode=${vowels.mode}`,
      })
    }
    try {
      const dig = window.localStorage.getItem('digraphs:session')
      if (dig) {
        const parsed = JSON.parse(dig) as {
          digraphId?: string
          digraphLabel?: string
          page?: number
          mode?: string
        }
        if (parsed.digraphId && parsed.digraphLabel) {
          items.push({
            id: 'digraphs',
            label: `Digraphs · ${parsed.digraphLabel}`,
            detail: `Page ${parsed.page ?? 1} · ${parsed.mode === 'play' ? 'Play' : 'Learn'}`,
            href: `${DIGRAPHS_BASE}/${parsed.digraphId}?page=${parsed.page ?? 1}&mode=${parsed.mode === 'play' ? 'play' : 'learn'}`,
          })
        }
      }
      const build = window.localStorage.getItem('build-word:session')
      if (build) {
        const parsed = JSON.parse(build) as {
          vowelId?: string
          vowelLabel?: string
          wordSlug?: string
        }
        if (parsed.vowelId && parsed.vowelLabel) {
          items.push({
            id: 'build',
            label: `Build the word · ${parsed.vowelLabel}`,
            detail: parsed.wordSlug ? `Last: ${parsed.wordSlug}` : 'Keep spelling',
            href: `${BUILD_WORD_BASE}/${parsed.vowelId}`,
          })
        }
      }
    } catch {
      // ignore
    }
    setContinues(items)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-violet-50 to-amber-50">
      <header className="border-b border-violet-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600">MonAlo Kids</p>
            <h1 className="text-2xl font-extrabold text-violet-950 sm:text-3xl">Learning playroom</h1>
          </div>
          <Link
            href="/dashboard/learning"
            className="rounded-2xl border-2 border-violet-200 bg-white px-4 py-2 text-sm font-bold text-violet-900 hover:bg-violet-50"
          >
            My courses
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-3xl border-2 border-white bg-white/90 p-6 text-center shadow-lg shadow-violet-900/5 sm:p-10">
          <p className="text-5xl" aria-hidden>
            🐧 Aa
          </p>
          <h2 className="mt-3 text-2xl font-extrabold text-violet-950 sm:text-3xl">
            Listen, look, and grow
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-violet-900/80 sm:text-base">
            Short games for curious kids — pick a world, practice a little, come back tomorrow.
          </p>
        </section>

        {continues.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-center text-sm font-bold uppercase tracking-widest text-violet-700/80">
              Continue
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {continues.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="rounded-3xl border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-sky-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Pick up</p>
                  <p className="mt-1 text-lg font-extrabold text-sky-950">{item.label}</p>
                  <p className="mt-1 text-sm text-sky-800/80">{item.detail}</p>
                  <p className="mt-3 text-sm font-bold text-teal-700">Continue →</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h3 className="text-center text-sm font-bold uppercase tracking-widest text-violet-700/80">
            Choose a game
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {games.map((game) => (
              <div
                key={game.id}
                className={`rounded-3xl border-2 bg-white/95 p-5 shadow-md ${
                  game.live ? 'border-white hover:shadow-lg' : 'border-dashed border-violet-200 opacity-90'
                }`}
              >
                <div
                  className={`inline-flex rounded-2xl bg-gradient-to-br ${game.accent} px-3 py-1 text-xs font-bold text-white`}
                >
                  {game.badge}
                </div>
                <h4 className="mt-3 text-xl font-extrabold text-violet-950">{game.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-violet-800/80">{game.blurb}</p>
                {game.live ? (
                  <Link
                    href={game.href}
                    className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-md"
                  >
                    Open →
                  </Link>
                ) : (
                  <p className="mt-4 text-sm font-bold text-violet-500">Coming soon</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
