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
import { WHICH_SOUND_BASE_PATH } from '@/lib/which-sound/constants'
import { readWhichSoundSession } from '@/lib/which-sound/session'
import { SEGMENT_WORD_BASE_PATH } from '@/lib/segment-the-word/constants'
import { readSegmentWordSession } from '@/lib/segment-the-word/session'
import { READ_STORY_BASE_PATH } from '@/lib/read-a-story/constants'
import { readReadStorySession } from '@/lib/read-a-story/session'
import { NURSERY_RHYME_BASE_PATH } from '@/lib/nursery-rhyme/constants'
import { readNurseryRhymeSession } from '@/lib/nursery-rhyme/session'
import { SIGHT_WORDS_BASE_PATH } from '@/lib/sight-words/constants'
import { readSightWordsSession } from '@/lib/sight-words/session'
import { CONSONANT_BLENDS_BASE_PATH } from '@/lib/consonant-blends/constants'
import { readConsonantBlendsSession } from '@/lib/consonant-blends/session'
import { SAY_IT_BASE_PATH } from '@/lib/say-it/constants'
import { readSayItSession } from '@/lib/say-it/session'
import { WRITE_IT_BASE_PATH } from '@/lib/write-it/constants'
import { readWriteItSession } from '@/lib/write-it/session'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'
import { readDigraphsSession } from '@/lib/digraphs/session'
import { BUILD_WORD_BASE_PATH, readBuildWordSession } from '@/lib/build-word/session'
import { ECO_PENGUIN_APP_NAME, type LearningGameCard } from '@/lib/learning/kids-hub'
import type { NextForYou } from '@/lib/learning/learning-path'
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
import EcoPenguinProgressCard from '@/features/learning/components/EcoPenguinProgressCard'
import EcoPenguinStickerStrip from '@/features/learning/components/EcoPenguinStickerStrip'
import type { EcoPenguinParentProgress } from '@/lib/learning/eco-penguin-progress'

type ContinueItem = {
  id: string
  label: string
  detail: string
  href: string
}

type Props = {
  games: LearningGameCard[]
  earnedStickerIds?: string[]
  nextForYou: NextForYou
  signedIn?: boolean
  parentProgress?: EcoPenguinParentProgress | null
}

export default function KidsLearningHub({
  games,
  earnedStickerIds = [],
  nextForYou,
  signedIn = false,
  parentProgress = null,
}: Props) {
  const [continues, setContinues] = useState<ContinueItem[]>([])

  useEffect(() => {
    const items: ContinueItem[] = []
    const rhyme = readNurseryRhymeSession()
    if (rhyme) {
      items.push({
        id: 'rhyme',
        label: `Rhyme time · ${rhyme.setId}`,
        detail: 'Tap the two pictures that rhyme',
        href: NURSERY_RHYME_BASE_PATH,
      })
    }
    const sayIt = readSayItSession()
    if (sayIt) {
      items.push({
        id: 'say-it',
        label: `Say it · ${sayIt.label}`,
        detail: 'Listen, say it out loud',
        href: SAY_IT_BASE_PATH,
      })
    }
    const writeIt = readWriteItSession()
    if (writeIt) {
      items.push({
        id: 'write-it',
        label: `Write it · ${writeIt.label}`,
        detail: writeIt.mode === 'trace' ? 'Trace a letter' : 'Build a sentence',
        href: WRITE_IT_BASE_PATH,
      })
    }
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
    const which = readWhichSoundSession()
    if (which) {
      items.push({
        id: 'which',
        label: `Which sound? · ${which.letter}`,
        detail: 'Which picture starts with that sound?',
        href: WHICH_SOUND_BASE_PATH,
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
    const segment = readSegmentWordSession()
    if (segment) {
      items.push({
        id: 'segment',
        label: `Segment · ${segment.word}`,
        detail: 'Hear the word, tap the sounds',
        href: SEGMENT_WORD_BASE_PATH,
      })
    }
    const sight = readSightWordsSession()
    if (sight) {
      items.push({
        id: 'sight',
        label: `Sight words · ${sight.word}`,
        detail: 'Hear the word, tap it',
        href: SIGHT_WORDS_BASE_PATH,
      })
    }
    const story = readReadStorySession()
    if (story) {
      items.push({
        id: 'story',
        label: `Story · ${story.storyId}`,
        detail: `Page ${story.page}`,
        href: READ_STORY_BASE_PATH,
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
    const dig = readDigraphsSession()
    if (dig) {
      items.push({
        id: 'digraphs',
        label: `Digraphs · ${dig.digraphLabel}`,
        detail: `Page ${dig.page} · ${dig.mode === 'play' ? 'Play' : 'Learn'}`,
        href: `${DIGRAPHS_BASE_PATH}/${dig.digraphId}?page=${dig.page}&mode=${dig.mode}`,
      })
    }
    const consonant = readConsonantBlendsSession()
    if (consonant) {
      items.push({
        id: 'consonant-blends',
        label: `Consonant blends · ${consonant.word}`,
        detail: 'Hear the blend, tap the picture',
        href: CONSONANT_BLENDS_BASE_PATH,
      })
    }
    const build = readBuildWordSession()
    if (build) {
      items.push({
        id: 'build',
        label: `Build the word · ${build.vowelLabel}`,
        detail: build.wordSlug ? `Last: ${build.wordSlug}` : 'Keep spelling',
        href: `${BUILD_WORD_BASE_PATH}/${build.vowelId}`,
      })
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
            Stage 1 ESL program — listening, phonics, sight words, and short stories. Mapped to
            Cambridge Early Years / Primary Stage 1 goals (not certified).
          </p>
          {!signedIn && (
            <div className="mx-auto mt-6 max-w-lg space-y-3">
              <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">
                Try free without an account —{' '}
                <Link href="/login?callbackUrl=/learning" className="underline hover:text-[#fafaf9]">
                  sign in
                </Link>{' '}
                to keep stickers and unlock the full path.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href={NURSERY_RHYME_BASE_PATH}
                  className={`${planetCard} border-cyan-400/40 bg-gradient-to-br from-cyan-400/15 to-transparent p-5 transition hover:-translate-y-0.5`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Try free</p>
                  <p className="mt-1 text-lg font-extrabold text-[#fafaf9]">Rhyme time</p>
                  <p className={`mt-1 text-sm ${planetTextMuted}`}>Tap the pictures that rhyme</p>
                </Link>
                <Link
                  href={LETTER_SOUNDS_BASE_PATH}
                  className={`${planetCard} border-sky-400/40 bg-gradient-to-br from-sky-400/15 to-transparent p-5 transition hover:-translate-y-0.5`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-sky-300">Try free</p>
                  <p className="mt-1 text-lg font-extrabold text-[#fafaf9]">Letter sounds</p>
                  <p className={`mt-1 text-sm ${planetTextMuted}`}>SATPIN letters — S A T P I N</p>
                </Link>
              </div>
            </div>
          )}
          {signedIn && (
            <p className="mx-auto mt-4 max-w-md rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100">
              Teacher with one phone?{' '}
              <Link href="/classroom" className="underline hover:text-[#fafaf9]">
                Classroom Mode
              </Link>{' '}
              tracks each kid separately.
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h3 className={`text-center text-sm font-bold uppercase tracking-widest ${planetTextDim}`}>
            Next for you
          </h3>
          <Link
            href={nextForYou.href}
            className={`${planetCard} block border-amber-400/40 bg-gradient-to-br from-amber-400/15 to-transparent p-6 transition hover:-translate-y-0.5 hover:border-amber-300/60 sm:p-8`}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Recommended</p>
            <p className="mt-2 text-2xl font-extrabold text-[#fafaf9]">{nextForYou.title}</p>
            <p className={`mt-2 text-sm sm:text-base ${planetTextMuted}`}>{nextForYou.detail}</p>
            <p className="mt-4 text-sm font-bold text-amber-300">Let&apos;s go →</p>
          </Link>
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

        {parentProgress && <EcoPenguinProgressCard progress={parentProgress} variant="hub" />}

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
                <div className="flex flex-wrap items-center gap-2">
                  {typeof game.step === 'number' && (
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#fafaf9]/15 text-xs font-black text-[#fafaf9]">
                      {game.step}
                    </span>
                  )}
                  <div
                    className={`inline-flex rounded-2xl bg-gradient-to-br ${game.accent} px-3 py-1 text-xs font-bold text-[#0c0a09]`}
                  >
                    {game.badge}
                  </div>
                  {game.cambridgeChip && (
                    <span className="inline-flex rounded-full border border-[#fafaf9]/20 bg-[#0c0a09]/40 px-2.5 py-1 text-[10px] font-bold tracking-wide text-sky-200 sm:text-xs">
                      {game.cambridgeChip}
                    </span>
                  )}
                </div>
                <h4 className="mt-3 text-xl font-extrabold text-[#fafaf9]">{game.title}</h4>
                <p className={`mt-2 text-sm leading-relaxed ${planetTextMuted}`}>{game.blurb}</p>
                {game.live ? (
                  signedIn || game.id === 'nursery-rhyme' || game.id === 'letter-sounds' ? (
                    <Link href={game.href} className={`${planetBtn.sun} mt-4 inline-flex`}>
                      {signedIn ? 'Open →' : 'Try free →'}
                    </Link>
                  ) : (
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(game.href)}`}
                      className={`${planetBtnSecondary} mt-4 inline-flex`}
                    >
                      Sign in to open →
                    </Link>
                  )
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
            <Link href={NURSERY_RHYME_BASE_PATH} className="hover:text-[#fafaf9]">
              Rhyme
            </Link>
            <Link href={SAY_IT_BASE_PATH} className="hover:text-[#fafaf9]">
              Say it
            </Link>
            <Link href={LETTER_SOUNDS_BASE_PATH} className="hover:text-[#fafaf9]">
              Sounds
            </Link>
            <Link href={WHICH_SOUND_BASE_PATH} className="hover:text-[#fafaf9]">
              Which?
            </Link>
            <Link href={BALLOON_LETTERS_BASE_PATH} className="hover:text-[#fafaf9]">
              Balloons
            </Link>
            <Link href={BLEND_WORD_BASE_PATH} className="hover:text-[#fafaf9]">
              Blend
            </Link>
            <Link href={SEGMENT_WORD_BASE_PATH} className="hover:text-[#fafaf9]">
              Segment
            </Link>
            <Link href={SIGHT_WORDS_BASE_PATH} className="hover:text-[#fafaf9]">
              Sight
            </Link>
            <Link href={WRITE_IT_BASE_PATH} className="hover:text-[#fafaf9]">
              Write
            </Link>
            <Link href={ECO_PENGUIN_BASE_PATH} className="hover:text-[#fafaf9]">
              Explore
            </Link>
            <Link href={VOWEL_WORDS_BASE_PATH} className="hover:text-[#fafaf9]">
              Vowels
            </Link>
            <Link href={DIGRAPHS_BASE_PATH} className="hover:text-[#fafaf9]">
              Digraphs
            </Link>
            <Link href={CONSONANT_BLENDS_BASE_PATH} className="hover:text-[#fafaf9]">
              Blends
            </Link>
            <Link href={BUILD_WORD_BASE_PATH} className="hover:text-[#fafaf9]">
              Build
            </Link>
            <Link href={READ_STORY_BASE_PATH} className="hover:text-[#fafaf9]">
              Story
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
