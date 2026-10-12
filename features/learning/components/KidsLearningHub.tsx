'use client'

import { useEffect, useMemo, useState } from 'react'
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
import EcoPenguin from '@/features/learning/components/eco/EcoPenguin'
import { useEcoVoice } from '@/features/learning/components/eco/useEcoVoice'
import ecoLines from '@/data/eco-guide/lines.json'
import { getRoomLock } from '@/lib/learning/room-locks'
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
  /** Sticker groups already earned (drives which rooms are still sleeping). */
  completedGroupIds?: string[]
}

const LINES = ecoLines as Record<string, string>
/** Rooms a signed-out visitor can try without an account. */
const FREE_ROOMS = new Set(['nursery-rhyme', 'letter-sounds'])

export default function KidsLearningHub({
  games,
  earnedStickerIds = [],
  nextForYou,
  signedIn = false,
  parentProgress = null,
  completedGroupIds = [],
}: Props) {
  const [continues, setContinues] = useState<ContinueItem[]>([])
  const voice = useEcoVoice()
  const introLine = signedIn && completedGroupIds.length > 0 ? 'welcome-back' : 'greeting'
  const nextLineId = `next-${nextForYou.id}`
  const introQueue = [introLine, nextLineId]
  const [message, setMessage] = useState<{ ids: string[]; text: string }>({
    ids: introQueue,
    text: `${LINES[introLine]} ${LINES[nextLineId] ?? ''}`.trim(),
  })
  const [intro, setIntro] = useState(true)
  const [explaining, setExplaining] = useState(false)

  const say = (id: string, text?: string, explain = false) => {
    setMessage({ ids: [id], text: text ?? LINES[id] ?? '' })
    setExplaining(explain)
    voice.play(id)
  }

  // Wave hello, then settle into pointing at the big button. Try to speak; browsers may block it
  // until the first tap, in which case the "Hear Eco" button is offered.
  useEffect(() => {
    voice.play(introQueue)
    const t = window.setTimeout(() => setIntro(false), 4000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mood = voice.speaking ? 'talk' : intro ? 'wave' : explaining ? 'idle' : 'point'
  const pathGames = useMemo(() => [...games].sort((a, b) => a.step - b.step), [games])

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
      <header className={planetHeader}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">MonAlo Kids</p>
            <h1 className="text-xl font-extrabold text-[#fafaf9] sm:text-3xl">{ECO_PENGUIN_APP_NAME}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={voice.toggleMute}
              aria-pressed={voice.muted}
              className={`${planetBtnSecondary} whitespace-nowrap !px-3 !py-2 !text-xs sm:!text-sm`}
            >
              {voice.muted ? '🔇 Off' : '🔊 On'}
            </button>
            {!signedIn && (
              <Link href="/login?from=ecopenguin&callbackUrl=/learning" className={`${planetBtnSecondary} whitespace-nowrap !px-3 !py-2 !text-xs sm:!text-sm`}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        {/* Eco greets and points at the one next step */}
        <section className={`${planetCard} p-6 sm:p-10`} aria-labelledby="eco-hello">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
            <div className="shrink-0">
              <EcoPenguin
                mood={mood}
                speaking={voice.speaking}
                tilting={explaining}
                pointAngle={-70}
                size={190}
                title="Eco the penguin"
              />
            </div>
            <div className="w-full flex-1 text-center md:text-left">
              <h2 id="eco-hello" className="sr-only">
                Eco the penguin says
              </h2>
              <div
                role="status"
                aria-live="polite"
                className="relative rounded-3xl bg-[#fafaf9] px-5 py-4 text-left text-base font-bold leading-snug text-[#0c0a09] sm:text-lg"
              >
                <span
                  aria-hidden
                  className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#fafaf9] md:-left-2 md:top-1/2 md:-translate-y-1/2 md:translate-x-0"
                />
                {message.text}
              </div>

              <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:justify-start">
                <Link
                  href={nextForYou.href}
                  onClick={() => voice.stop()}
                  className={`${planetBtn.sun} inline-flex items-center justify-center !px-8 !py-4 !text-lg shadow-lg shadow-amber-500/30 ring-2 ring-amber-200/60 animate-pulse motion-reduce:animate-none`}
                >
                  Let&apos;s play: {nextForYou.title} →
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setExplaining(false)
                    voice.play(message.ids, { force: true })
                  }}
                  className={`${planetBtnSecondary} !py-3`}
                >
                  {voice.blocked ? '🔊 Tap to hear Eco' : '🔊 Hear Eco again'}
                </button>
              </div>
              <p className={`mt-3 text-sm ${planetTextMuted}`}>{nextForYou.detail}</p>
              {!signedIn && (
                <p className="mt-3 text-sm font-semibold text-amber-100">
                  Rhyme time and Letter sounds are free to try.{' '}
                  <Link href="/login?from=ecopenguin&callbackUrl=/learning" className="underline hover:text-[#fafaf9]">
                    Sign in
                  </Link>{' '}
                  to keep your stickers.
                </p>
              )}
            </div>
          </div>
        </section>

        <EcoPenguinStickerStrip earnedIds={earnedStickerIds} />

        {continues.length > 0 && (
          <section className="space-y-3">
            <h3 className={`text-center text-sm font-bold uppercase tracking-widest ${planetTextDim}`}>
              Pick up where you left off
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {continues.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${planetCard} p-5 transition hover:-translate-y-0.5 hover:bg-[#292524]`}
                >
                  <p className="text-lg font-extrabold text-[#fafaf9]">{item.label}</p>
                  <p className={`mt-1 text-sm ${planetTextMuted}`}>{item.detail}</p>
                  <p className="mt-3 text-sm font-bold text-amber-300">Continue →</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* The path: one stone per room, in learning order */}
        <section aria-labelledby="path-heading" className="space-y-5">
          <div className="text-center">
            <h3 id="path-heading" className="text-2xl font-extrabold text-[#fafaf9] sm:text-3xl">
              Follow the path with Eco
            </h3>
            <button
              type="button"
              onClick={() => say('pick')}
              className="mt-2 text-sm font-bold text-sky-300 hover:underline"
            >
              What should I pick?
            </button>
          </div>
          <ol className="mx-auto max-w-2xl">
            {pathGames.map((game, i) => {
              const lock = getRoomLock(game.id, completedGroupIds)
              const needsSignIn = !signedIn && !FREE_ROOMS.has(game.id)
              const isNext = game.id === nextForYou.id
              const isLast = i === pathGames.length - 1
              const stoneClass = lock || needsSignIn
                ? 'border-[#fafaf9]/20 bg-[#292524] text-[#a8a29e]'
                : `border-transparent bg-gradient-to-br ${game.accent} text-[#0c0a09]`
              return (
                <li key={game.id} className="relative grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 pb-4 sm:gap-4">
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute bottom-0 left-7 top-14 -translate-x-1/2 border-l-2 border-dashed border-[#fafaf9]/20"
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border text-lg font-black ${stoneClass} ${
                      isNext ? 'ring-4 ring-amber-300/70' : ''
                    }`}
                    aria-hidden
                  >
                    {lock || needsSignIn ? '🔒' : game.step}
                  </span>
                  <div
                    className={`${planetCard} p-4 sm:p-5 ${
                      isNext ? 'border-amber-300/60 bg-amber-300/10' : ''
                    } ${lock || needsSignIn ? 'opacity-90' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-extrabold text-[#fafaf9] sm:text-xl">{game.title}</h4>
                        {isNext && (
                          <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-amber-300">
                            Eco says: start here
                          </p>
                        )}
                      </div>
                      {isNext && (
                        <span className="-mt-2 shrink-0">
                          <EcoPenguin mood="point" pointAngle={-75} size={56} title="Eco pointing here" />
                        </span>
                      )}
                    </div>
                    <p className={`mt-1.5 text-sm leading-relaxed ${planetTextMuted}`}>{game.blurb}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {lock ? (
                        <>
                          <button
                            type="button"
                            onClick={() => say(lock.lineId, lock.message, true)}
                            className={`${planetBtnSecondary} !py-2`}
                          >
                            Why is it sleeping?
                          </button>
                          <Link href={BALLOON_LETTERS_BASE_PATH} className={`${planetBtn.sun} !py-2`}>
                            Catch balloons
                          </Link>
                        </>
                      ) : needsSignIn ? (
                        <>
                          <button
                            type="button"
                            onClick={() => say('signin', undefined, true)}
                            className={`${planetBtnSecondary} !py-2`}
                          >
                            What does Eco say?
                          </button>
                          <Link
                            href={`/login?from=ecopenguin&callbackUrl=${encodeURIComponent(game.href)}`}
                            className={`${planetBtn.sun} !py-2`}
                          >
                            Sign in to open
                          </Link>
                        </>
                      ) : game.live ? (
                        <Link
                          href={game.href}
                          onClick={() => voice.stop()}
                          className={`${planetBtn.sun} !py-2`}
                        >
                          {signedIn ? 'Play →' : 'Try free →'}
                        </Link>
                      ) : (
                        <p className={`text-sm font-bold ${planetTextDim}`}>Coming soon</p>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        {/* Details parents care about, out of the child's way */}
        <details className={`${planetCard} group p-5 sm:p-6`}>
          <summary className="cursor-pointer list-none text-lg font-extrabold text-[#fafaf9] marker:content-none">
            <span aria-hidden className="mr-2 inline-block transition group-open:rotate-90">
              ▸
            </span>
            For grown-ups
          </summary>
          <div className="mt-4 space-y-5">
            <p className={`text-sm leading-relaxed ${planetTextMuted}`}>
              Eco Penguin is a Stage 1 ESL program: listening, phonics, sight words and short stories.
              Mapped to Cambridge Early Years / Primary Stage 1 goals (not certified). Rooms open as your
              child earns stickers in Balloon letters, so they always meet words they can already sound out.
            </p>
            {parentProgress && <EcoPenguinProgressCard progress={parentProgress} variant="hub" />}
            {signedIn ? (
              <p className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100">
                Teacher with one phone?{' '}
                <Link href="/classroom" className="underline hover:text-[#fafaf9]">
                  Classroom Mode
                </Link>{' '}
                tracks each kid separately.
              </p>
            ) : (
              <p className={`text-sm ${planetTextMuted}`}>
                <Link href="/login?from=ecopenguin&callbackUrl=/learning" className="font-bold text-sky-300 underline">
                  Sign in
                </Link>{' '}
                to see your child&apos;s progress and keep their stickers.
              </p>
            )}
            <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {pathGames.map((game) => (
                <li key={game.id} className={planetTextMuted}>
                  <span className="font-bold text-[#fafaf9]">{game.title}</span> · {game.cambridgeChip}
                </li>
              ))}
            </ul>
          </div>
        </details>
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
