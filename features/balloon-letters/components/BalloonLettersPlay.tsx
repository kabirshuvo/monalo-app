'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BALLOON_COLORS,
  balloonLettersTheme,
} from '@/features/balloon-letters/balloon-letters-theme'
import EcoPenguinGuide, {
  type GuideOverride,
} from '@/features/learning/components/EcoPenguinGuide'
import {
  playVowelWordsAudio,
  playVowelWordsSequence,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import { BALLOON_COUNT } from '@/lib/balloon-letters/constants'
import { writeBalloonLettersSession } from '@/lib/balloon-letters/session'
import {
  computePhonicsProgress,
  getStickerForGroup,
  groupLabel,
  isPhonicsGroupId,
  PHONICS_GROUP_LETTER_IDS,
  type PhonicsGroupId,
  type PhonicsSticker,
} from '@/lib/learning/phonics-progress'
import type { LetterSound } from '@/lib/letter-sounds/types'

type Props = {
  letters: LetterSound[]
  masteredKeys?: string[]
  initialGroupId: PhonicsGroupId
  successAudio: string
  errorAudio: string
}

type Balloon = {
  id: string
  letterId: string
  letter: string
  x: number
  y: number
  speed: number
  color: string
  swayAmp: number
  swaySpeed: number
  phase: number
  popping: boolean
}

type Win = {
  letter: LetterSound
  points: number | null
  already: boolean
}

type StickerGift = {
  sticker: PhonicsSticker
  points: number
  nextGroupId: PhonicsGroupId | null
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function makeBalloon(letter: LetterSound, index: number, total: number): Balloon {
  return {
    id: `${letter.id}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    letterId: letter.id,
    letter: letter.letter,
    x: 8 + (index / Math.max(total - 1, 1)) * 76 + (Math.random() * 6 - 3),
    y: 70 + Math.random() * 40,
    speed: 0.008 + Math.random() * 0.012,
    color: BALLOON_COLORS[index % BALLOON_COLORS.length],
    swayAmp: 1.2 + Math.random() * 1.8,
    swaySpeed: 0.0015 + Math.random() * 0.002,
    phase: Math.random() * Math.PI * 2,
    popping: false,
  }
}

function spawnBalloons(letters: LetterSound[], target: LetterSound): Balloon[] {
  const others = shuffle(letters.filter((letter) => letter.id !== target.id))
  const pool = [target, ...others].slice(0, BALLOON_COUNT)
  while (pool.length < BALLOON_COUNT && letters.length > 0) {
    pool.push(letters[pool.length % letters.length])
  }
  return shuffle(pool).map((letter, index) => makeBalloon(letter, index, pool.length))
}

export default function BalloonLettersPlay({
  letters,
  masteredKeys = [],
  initialGroupId,
  successAudio,
  errorAudio,
}: Props) {
  const [heard, setHeard] = useState<string[]>([])
  const [activeGroupId, setActiveGroupId] = useState<PhonicsGroupId>(initialGroupId)
  const [target, setTarget] = useState<LetterSound | null>(null)
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [win, setWin] = useState<Win | null>(null)
  const [stickerGift, setStickerGift] = useState<StickerGift | null>(null)
  const [checking, setChecking] = useState(false)
  const [guideOverride, setGuideOverride] = useState<GuideOverride | null>(null)
  const balloonsRef = useRef<Balloon[]>([])
  const targetIdRef = useRef<string | null>(null)
  const rafRef = useRef<number>(0)
  const lastTsRef = useRef<number>(0)

  const mastered = useMemo(() => {
    const set = new Set(masteredKeys)
    for (const id of heard) set.add(id)
    return set
  }, [masteredKeys, heard])

  const groupLetters = useMemo(
    () => letters.filter((letter) => letter.group === activeGroupId),
    [letters, activeGroupId]
  )

  const groupLetterIds = PHONICS_GROUP_LETTER_IDS[activeGroupId]

  const pickNext = useCallback(
    (excludeId?: string) => {
      const unseen = groupLetters.filter(
        (letter) => letter.id !== excludeId && !mastered.has(letter.id)
      )
      const others = groupLetters.filter((letter) => letter.id !== excludeId)
      const pool = unseen.length > 0 ? unseen : others.length > 0 ? others : groupLetters
      if (pool.length === 0) return null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [groupLetters, mastered]
  )

  const playPrompt = useCallback((letter: LetterSound) => {
    playVowelWordsSequence([
      { src: letter.audio.keyword, fallbackText: letter.speak.keyword },
      { src: letter.audio.sound, fallbackText: letter.speak.sound },
    ])
  }, [])

  const ask = useCallback(
    (letter: LetterSound, pool: LetterSound[]) => {
      stopVowelWordsAudio()
      const nextBalloons = spawnBalloons(pool, letter)
      balloonsRef.current = nextBalloons
      targetIdRef.current = letter.id
      setTarget(letter)
      setBalloons(nextBalloons)
      setWrongId(null)
      setWin(null)
      setStickerGift(null)
      setChecking(false)
      writeBalloonLettersSession({ letterId: letter.id, letter: letter.letter })
      playPrompt(letter)
    },
    [playPrompt]
  )

  useEffect(() => {
    const pool = letters.filter((letter) => letter.group === activeGroupId)
    const first =
      pool.find((letter) => !mastered.has(letter.id)) ??
      pool[Math.floor(Math.random() * pool.length)]
    if (first) ask(first, pool)
    return () => {
      stopVowelWordsAudio()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (win || checking || stickerGift) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const tick = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts
      const dt = Math.min(32, ts - lastTsRef.current)
      lastTsRef.current = ts

      const current = balloonsRef.current
      const targetId = targetIdRef.current
      let targetOnScreen = false

      const next = current.map((balloon) => {
        if (balloon.popping) return balloon
        let y = balloon.y - balloon.speed * dt
        let letterId = balloon.letterId
        let letter = balloon.letter
        let color = balloon.color
        const phase = balloon.phase + balloon.swaySpeed * dt

        if (y < -18) {
          y = 108 + Math.random() * 12
          const replacements = groupLetters.filter((item) => item.id !== targetId)
          const pick =
            Math.random() < 0.45 && targetId
              ? groupLetters.find((item) => item.id === targetId)
              : replacements[Math.floor(Math.random() * replacements.length)]
          if (pick) {
            letterId = pick.id
            letter = pick.letter
            color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]
          }
        }

        if (letterId === targetId) targetOnScreen = true
        return { ...balloon, y, letterId, letter, color, phase }
      })

      if (!targetOnScreen && targetId) {
        const letter = groupLetters.find((item) => item.id === targetId)
        if (letter && next.length > 0) {
          const idx = Math.floor(Math.random() * next.length)
          next[idx] = {
            ...next[idx],
            letterId: letter.id,
            letter: letter.letter,
            y: 100 + Math.random() * 10,
          }
        }
      }

      balloonsRef.current = next
      setBalloons(
        next.map((balloon) => ({
          ...balloon,
          x: balloon.x + Math.sin(balloon.phase) * balloon.swayAmp,
        }))
      )
      rafRef.current = requestAnimationFrame(tick)
    }

    lastTsRef.current = 0
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [win, checking, stickerGift, groupLetters])

  const continueAfterGift = () => {
    const gift = stickerGift
    setStickerGift(null)
    setGuideOverride(null)
    setWin(null)
    if (!gift?.nextGroupId) {
      const again = pickNext()
      if (again) ask(again, groupLetters)
      return
    }
    const nextId = gift.nextGroupId
    const pool = letters.filter((letter) => letter.group === nextId)
    setActiveGroupId(nextId)
    const first = pool.find((letter) => !mastered.has(letter.id)) ?? pool[0]
    if (first) ask(first, pool)
  }

  const choose = (balloon: Balloon) => {
    if (!target || checking || win || stickerGift || balloon.popping) return
    if (balloon.letterId !== target.id) {
      setWrongId(balloon.id)
      playVowelWordsAudio(errorAudio, {
        fallbackText: 'Try again',
        onEnded: () => playPrompt(target),
      })
      window.setTimeout(() => setWrongId(null), 500)
      return
    }

    setChecking(true)
    setWrongId(null)
    const popped = balloonsRef.current.map((item) =>
      item.id === balloon.id ? { ...item, popping: true } : item
    )
    balloonsRef.current = popped
    setBalloons(popped)
    setWin({ letter: target, points: 2, already: false })
    playVowelWordsAudio(successAudio, { fallbackText: `Great! ${target.letter}` })

    const nextHeard = heard.includes(target.id) ? heard : [...heard, target.id]
    setHeard(nextHeard)

    void api
      .post<{
        awarded?: boolean
        points?: number
        stickerAwarded?: boolean
        stickerPoints?: number
        stickerId?: string | null
        stickerLabel?: string | null
        stickerEmoji?: string | null
        completedGroupId?: string | null
        nextGroupId?: string | null
      }>('/api/learning/balloon-letters/celebrate', {
        letterId: target.id,
      })
      .then((res) => {
        setWin((prev) => {
          if (!prev || prev.letter.id !== target.id) return prev
          if (res.awarded) return { ...prev, points: res.points ?? 2, already: false }
          return { ...prev, points: null, already: true }
        })

        if (res.stickerAwarded && res.stickerId) {
          const catalog = getStickerForGroup(activeGroupId)
          const sticker: PhonicsSticker = catalog ?? {
            groupId: activeGroupId,
            id: res.stickerId,
            label: res.stickerLabel ?? 'Sticker',
            emoji: res.stickerEmoji ?? '🎁',
            referenceId: `sticker:${res.stickerId}`,
          }
          const rawNext = res.nextGroupId
          const nextGroupId: PhonicsGroupId | null =
            rawNext && isPhonicsGroupId(rawNext) ? rawNext : null
          window.setTimeout(() => {
            setStickerGift({
              sticker,
              points: res.stickerPoints ?? 5,
              nextGroupId,
            })
            setGuideOverride({
              tipId: `sticker-${sticker.id}`,
              message: nextGroupId
                ? `You earned the ${sticker.label}! Next set unlocked: ${groupLabel(nextGroupId)}.`
                : `You earned the ${sticker.label}! You finished every letter set.`,
            })
          }, 900)
          return
        }

        const masteredNow = new Set(mastered)
        masteredNow.add(target.id)
        const progress = computePhonicsProgress(masteredNow)
        const groupDone = progress.completedGroupIds.includes(activeGroupId)
        if (groupDone && !res.stickerAwarded) {
          // Already had sticker — advance after short celebrate
          window.setTimeout(() => {
            const nextId =
              (res.nextGroupId as PhonicsGroupId | null) ??
              progress.unlockedGroupIds.find((id) => !progress.completedGroupIds.includes(id)) ??
              null
            if (nextId && nextId !== activeGroupId) {
              const pool = letters.filter((letter) => letter.group === nextId)
              setActiveGroupId(nextId)
              setWin(null)
              const first = pool.find((letter) => !masteredNow.has(letter.id)) ?? pool[0]
              if (first) ask(first, pool)
            } else {
              setWin(null)
              const again = pickNext(target.id)
              if (again) ask(again, groupLetters)
            }
          }, 2200)
          return
        }

        const next = pickNext(target.id)
        window.setTimeout(() => {
          if (next) ask(next, groupLetters)
        }, 2200)
      })
      .catch(() => {
        const next = pickNext(target.id)
        window.setTimeout(() => {
          if (next) ask(next, groupLetters)
        }, 2200)
      })
  }

  if (!target || groupLetters.length === 0) {
    return (
      <p className={`${balloonLettersTheme.card} py-12 text-center font-semibold text-[#d6d3d1]`}>
        No letters to catch yet.
      </p>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 py-4 sm:gap-5 sm:py-5">
      <EcoPenguinGuide room="balloon-letters" override={guideOverride} />

      <section className="mx-auto w-full max-w-5xl shrink-0 px-4 sm:px-6">
        <div className={`${balloonLettersTheme.card} space-y-3 p-5 text-center sm:p-6`}>
          {stickerGift ? (
            <div className="space-y-3" aria-live="polite">
              <p className="text-5xl" aria-hidden>
                🐧🎁{stickerGift.sticker.emoji}
              </p>
              <p className="text-sm font-bold uppercase tracking-widest text-amber-300">Sticker gift</p>
              <h2 className="text-2xl font-extrabold text-[#fafaf9] sm:text-3xl">
                {stickerGift.sticker.label}
              </h2>
              <p className="mx-auto w-fit rounded-full bg-amber-400/20 px-5 py-2 text-sm font-extrabold text-[#fafaf9]">
                +{stickerGift.points} points!
              </p>
              {stickerGift.nextGroupId ? (
                <p className="text-sm font-bold text-sky-300">
                  Next set unlocked: {groupLabel(stickerGift.nextGroupId)}
                </p>
              ) : (
                <p className="text-sm font-bold text-sky-300">You finished every letter set!</p>
              )}
              <button
                type="button"
                onClick={continueAfterGift}
                className={`${balloonLettersTheme.btnPrimary} px-6 py-3`}
              >
                {stickerGift.nextGroupId ? 'Play next set' : 'Keep playing'}
              </button>
            </div>
          ) : win ? (
            <div className="space-y-2" aria-live="polite">
              <p className="text-4xl motion-safe:animate-bounce" aria-hidden>
                🎉🎈⭐
              </p>
              {win.points !== null && (
                <p className="mx-auto w-fit rounded-full bg-amber-400/20 px-5 py-2 text-sm font-extrabold text-[#fafaf9]">
                  +{win.points} points!
                </p>
              )}
              {win.already && (
                <p className="mx-auto w-fit rounded-full bg-sky-400/20 px-5 py-2 text-sm font-extrabold text-sky-200">
                  You&apos;ve got this one!
                </p>
              )}
              <p className="text-5xl font-black text-[#fafaf9]">{win.letter.letter}</p>
              <p className="text-sm font-bold text-sky-300">Next letter…</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold uppercase tracking-widest text-sky-300">Balloon letters</p>
              <h2 className="text-2xl font-extrabold text-[#fafaf9] sm:text-3xl">
                Tap the letter you hear
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
                Set · {groupLabel(activeGroupId)}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1" aria-label="Set progress">
                {groupLetterIds.map((id) => {
                  const done = mastered.has(id)
                  return (
                    <span
                      key={id}
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-black ${
                        done
                          ? 'bg-emerald-400/25 text-emerald-200'
                          : 'bg-[#292524] text-[#a8a29e]'
                      }`}
                    >
                      {id}
                    </span>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => playPrompt(target)}
                className={`${balloonLettersTheme.btnPrimary} px-6 py-3`}
              >
                Hear again
              </button>
            </>
          )}
        </div>
      </section>

      {!win && !stickerGift && (
        <div
          className={`${balloonLettersTheme.playfield} sm:mx-4 sm:max-w-none lg:mx-6`}
          aria-label="Flying balloons"
        >
          {balloons.map((balloon) => {
            const isWrong = wrongId === balloon.id
            return (
              <button
                key={balloon.id}
                type="button"
                disabled={checking}
                onClick={() => choose(balloon)}
                className={`absolute flex min-h-14 min-w-14 -translate-x-1/2 flex-col items-center transition ${
                  balloon.popping ? 'scale-150 opacity-0 duration-300' : 'opacity-100'
                } ${isWrong ? 'animate-pulse' : ''}`}
                style={{
                  left: `${balloon.x}%`,
                  top: `${balloon.y}%`,
                }}
                aria-label={`Balloon ${balloon.letter}`}
              >
                <span
                  className="flex h-16 w-14 items-center justify-center rounded-[50%] text-3xl font-black text-[#fafaf9] shadow-lg sm:h-20 sm:w-16 sm:text-4xl"
                  style={{
                    background: `radial-gradient(circle at 35% 28%, #fafaf9 0%, ${balloon.color} 42%, ${balloon.color} 100%)`,
                    boxShadow: `0 8px 20px ${balloon.color}55`,
                  }}
                >
                  {balloon.letter}
                </span>
                <span
                  className="mt-0.5 h-8 w-px sm:h-10"
                  style={{ background: 'linear-gradient(to bottom, #a8a29e, transparent)' }}
                  aria-hidden
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
