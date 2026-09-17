'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { letterSoundsTheme } from '@/features/letter-sounds/letter-sounds-theme'
import {
  playVowelWordsAudio,
  playVowelWordsSequence,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import { LETTER_SOUNDS_BASE_PATH } from '@/lib/letter-sounds/constants'
import { writeLetterSoundsSession } from '@/lib/letter-sounds/session'
import type { LetterSound } from '@/lib/letter-sounds/types'

type Props = {
  letters: LetterSound[]
  masteredKeys?: string[]
  questionAudio: string
  successAudio: string
  errorAudio: string
}

type Win = {
  letter: LetterSound
  points: number | null
  already: boolean
}

export default function LetterSoundsQuiz({
  letters,
  masteredKeys = [],
  questionAudio,
  successAudio,
  errorAudio,
}: Props) {
  const [heard, setHeard] = useState<string[]>([])
  const [target, setTarget] = useState<LetterSound | null>(null)
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [win, setWin] = useState<Win | null>(null)
  const [checking, setChecking] = useState(false)

  const mastered = useMemo(() => {
    const set = new Set(masteredKeys)
    for (const id of heard) set.add(id)
    return set
  }, [masteredKeys, heard])

  const pickNext = useCallback(
    (excludeId?: string) => {
      const unseen = letters.filter((letter) => letter.id !== excludeId && !mastered.has(letter.id))
      const others = letters.filter((letter) => letter.id !== excludeId)
      const pool = unseen.length > 0 ? unseen : others.length > 0 ? others : letters
      if (pool.length === 0) return null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [letters, mastered]
  )

  const ask = useCallback((letter: LetterSound) => {
    stopVowelWordsAudio()
    setTarget(letter)
    setWrongId(null)
    setWin(null)
    setChecking(false)
    writeLetterSoundsSession({ letterId: letter.id, keyword: letter.keyword, mode: 'quiz' })
    playVowelWordsSequence([
      { src: questionAudio, fallbackText: 'Listen. Which letter?' },
      { src: letter.audio.keyword, fallbackText: letter.speak.keyword },
      { src: letter.audio.sound, fallbackText: letter.speak.sound },
    ])
  }, [questionAudio])

  useEffect(() => {
    const first = pickNext()
    if (first) ask(first)
    return () => stopVowelWordsAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const choose = (letter: LetterSound) => {
    if (!target || checking || win) return
    if (letter.id !== target.id) {
      setWrongId(letter.id)
      playVowelWordsAudio(errorAudio, { fallbackText: 'Try again' })
      return
    }
    setChecking(true)
    setWrongId(null)
    setWin({ letter: target, points: 2, already: false })
    playVowelWordsAudio(successAudio, { fallbackText: `Great! ${target.keyword}` })
    void api
      .post<{ awarded?: boolean; points?: number }>('/api/learning/letter-sounds/celebrate', {
        letterId: target.id,
      })
      .then((res) => {
        setWin((prev) => {
          if (!prev || prev.letter.id !== target.id) return prev
          if (res.awarded) return { ...prev, points: res.points ?? 2, already: false }
          return { ...prev, points: null, already: true }
        })
      })
      .catch(() => undefined)
    setHeard((prev) => (prev.includes(target.id) ? prev : [...prev, target.id]))
    const next = pickNext(target.id)
    window.setTimeout(() => {
      if (next) ask(next)
    }, 1800)
  }

  if (!target) {
    return (
      <p className={`${letterSoundsTheme.card} py-12 text-center font-semibold text-emerald-800`}>
        No letters to quiz yet.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className={`${letterSoundsTheme.card} space-y-4 p-6 text-center sm:p-8`}>
        {win ? (
          <>
            <p className="text-4xl motion-safe:animate-bounce" aria-hidden>
              🎉🔤⭐
            </p>
            {win.points !== null && (
              <p className="mx-auto w-fit rounded-full bg-amber-100 px-5 py-2 text-sm font-extrabold text-amber-950">
                +{win.points} points!
              </p>
            )}
            {win.already && (
              <p className="mx-auto w-fit rounded-full bg-emerald-100 px-5 py-2 text-sm font-extrabold text-emerald-900">
                You&apos;ve got this one!
              </p>
            )}
            <p className="text-6xl font-black text-emerald-950">{win.letter.letter}</p>
            <p className="text-sm font-bold text-emerald-700">Next letter…</p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Quiz</p>
            <h2 className="text-2xl font-extrabold text-emerald-950">Listen. Which letter?</h2>
            <button
              type="button"
              onClick={() =>
                playVowelWordsSequence([
                  { src: target.audio.keyword, fallbackText: target.speak.keyword },
                  { src: target.audio.sound, fallbackText: target.speak.sound },
                ])
              }
              className={`${letterSoundsTheme.btnPrimary} px-6 py-3`}
            >
              Hear the sound
            </button>
          </>
        )}
      </section>

      {!win && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7" aria-label="Letter choices">
          {letters.map((letter) => {
            const isWrong = wrongId === letter.id
            return (
              <button
                key={letter.id}
                type="button"
                onClick={() => choose(letter)}
                disabled={checking}
                className={`${letterSoundsTheme.card} py-3 text-2xl font-black text-emerald-950 transition active:scale-95 sm:text-3xl ${
                  isWrong ? 'ring-4 ring-rose-300' : 'hover:ring-2 hover:ring-emerald-300'
                }`}
              >
                {letter.letter}
              </button>
            )
          })}
        </div>
      )}

      <footer className={`${letterSoundsTheme.card} p-6 text-center sm:p-8`}>
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Keep going</p>
        <h2 className="mt-2 text-2xl font-extrabold text-emerald-950 sm:text-3xl">Need another listen?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-emerald-900/80 sm:text-base">
          Go back to the letters and hear S for sun, then the sound, before you try again.
        </p>
        <Link href={LETTER_SOUNDS_BASE_PATH} className={`${letterSoundsTheme.btnPrimary} mt-5 inline-flex px-6 py-3`}>
          Back to the letters
        </Link>
      </footer>
    </div>
  )
}
