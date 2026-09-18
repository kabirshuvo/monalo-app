'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { readEcoPenguinSession } from '@/lib/ecopenguin/session'
import { readVowelWordsSession } from '@/lib/vowel-words/session'
import { ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'
import { BLEND_WORD_BASE_PATH } from '@/lib/blend-the-word/constants'
import { readBlendWordSession } from '@/lib/blend-the-word/session'
import { BALLOON_LETTERS_BASE_PATH } from '@/lib/balloon-letters/constants'
import { readBalloonLettersSession } from '@/lib/balloon-letters/session'
import { LETTER_SOUNDS_BASE_PATH, LETTER_SOUNDS_QUIZ_PATH } from '@/lib/letter-sounds/constants'
import { readLetterSoundsSession } from '@/lib/letter-sounds/session'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'
import { ECO_PENGUIN_APP_NAME, type LearningGameCard } from '@/lib/learning/kids-hub'
import {
  planetBtn,
  planetBtnSecondary,
  planetCard,
  planetFooter,
  planetHeader,
  planetShell,
  planetTextDim,
  planetTextMuted,
} from '@/lib/learning/planet-theme'
import EcoPenguinGuide from '@/features/learning/components/EcoPenguinGuide'
import EcoPenguinStickerStrip from '@/features/learning/components/EcoPenguinStickerStrip'

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
  earnedStickerIds?: string[]
}

export default function KidsLearningHub({ games, earnedStickerIds = [] }: Props) {
  const [continues, setContinues] = useState<ContinueItem[]>([])

  useEffect(() => {
    const items: ContinueItem[] = []
    const letters = readLetterSoundsSession()
    if (letters) {
      items.push({
        id: 'letters',
        label: `Letter sounds · ${letters.letterId}`,
        detail: letters.mode === 'quiz' ? 'Quiz' : `Last sound: ${letters.keyword}`,
        href: letters.mode === 'quiz' ? LETTER_SOUNDS_QUIZ_PATH : LETTER_SOUNDS_BASE_PATH,
      })
    }
    const balloons = readBalloonLettersSession()
    if (balloons) {
      items.push({
        id: 'balloons',
        label: `Balloon letters · ${balloons.letter}`,
        detail: 'Listen, then tap the balloon',
        href: BALLOON_LETTERS_BASE_PATH,
      })
    }
    const blend = readBlendWordSession()
    if (blend) {
      items.push({
        id: 'blend',
        label: `Blend the word · ${blend.word}`,
        detail: 'Hear the sounds, tap the picture',
        href: BLEND_WORD_BASE_PATH,
      })
    }
    const eco = readEcoPenguinSession()
    if (eco) {
      items.push({
        id: 'eco',
        label: `Explore · ${eco.categoryName}`,
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
    <div className={`flex min-h-screen flex-col ${planetShell}`}>
      <EcoPenguinGuide room="hub" />
      <header className={planetHeader}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">MonAlo Kids</p>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-[#fafaf9] sm:text-3xl">
              <span aria-hidden>🐧</span>
              {ECO_PENGUIN_APP_NAME}
            </h1>
          </div>
          <Link href="/dashboard/learning" className={`${planetBtnSecondary} px-4 py-2`}>
            My courses
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        <section className={`${planetCard} p-6 text-center sm:p-10`}>
          <p className="text-5xl" aria-hidden>
            🐧
          </p>
          <h2 className="mt-3 text-2xl font-extrabold text-[#fafaf9] sm:text-3xl">
            Welcome to {ECO_PENGUIN_APP_NAME}
          </h2>
          <p className={`mx-auto mt-3 max-w-lg text-sm leading-relaxed sm:text-base ${planetTextMuted}`}>
            Hear letter sounds, catch balloons, blend a word, then pictures, vowels, and spelling —
            pick a room and play a little each day.
          </p>
        </section>

        {continues.length > 0 && (
          <section className="space-y-3">
            <h3 className={`text-center text-sm font-bold uppercase tracking-widest ${planetTextDim}`}>
              Continue
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {continues.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${planetCard} p-5 transition hover:-translate-y-0.5 hover:bg-[#292524]`}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-sky-300">Pick up</p>
                  <p className="mt-1 text-lg font-extrabold text-[#fafaf9]">{item.label}</p>
                  <p className={`mt-1 text-sm ${planetTextMuted}`}>{item.detail}</p>
                  <p className="mt-3 text-sm font-bold text-amber-300">Continue →</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <EcoPenguinStickerStrip earnedIds={earnedStickerIds} />

        <section className="space-y-4">
          <h3 className={`text-center text-sm font-bold uppercase tracking-widest ${planetTextDim}`}>
            Choose a room
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {games.map((game) => (
              <div
                key={game.id}
                className={`${planetCard} p-5 ${
                  game.live ? 'hover:bg-[#292524]' : 'border-dashed opacity-90'
                }`}
              >
                <div
                  className={`inline-flex rounded-2xl bg-gradient-to-br ${game.accent} px-3 py-1 text-xs font-bold text-[#0c0a09]`}
                >
                  {game.badge}
                </div>
                <h4 className="mt-3 text-xl font-extrabold text-[#fafaf9]">{game.title}</h4>
                <p className={`mt-2 text-sm leading-relaxed ${planetTextMuted}`}>{game.blurb}</p>
                {game.live ? (
                  <Link href={game.href} className={`${planetBtn.sun} mt-4 inline-flex`}>
                    Open →
                  </Link>
                ) : (
                  <p className={`mt-4 text-sm font-bold ${planetTextDim}`}>Coming soon</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={planetFooter}>
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Eco Penguin</p>
            <p className="mt-1 text-sm text-[#d6d3d1]">
              Letter sounds, balloons, blending, and spelling for kids learning English.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-sky-200">
            <Link href={LETTER_SOUNDS_BASE_PATH} className="hover:text-[#fafaf9]">
              Letter sounds
            </Link>
            <Link href={BALLOON_LETTERS_BASE_PATH} className="hover:text-[#fafaf9]">
              Balloons
            </Link>
            <Link href={BLEND_WORD_BASE_PATH} className="hover:text-[#fafaf9]">
              Blend
            </Link>
            <Link href={VOWEL_WORDS_BASE_PATH} className="hover:text-[#fafaf9]">
              Vowels
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
