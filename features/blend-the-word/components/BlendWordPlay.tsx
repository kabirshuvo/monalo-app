'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import { blendWordTheme } from '@/features/blend-the-word/blend-word-theme'
import {
  playVowelWordsAudio,
  playVowelWordsSequence,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import { BLEND_WORD_CHOICES } from '@/lib/blend-the-word/constants'
import { writeBlendWordSession } from '@/lib/blend-the-word/session'
import type { BlendWord } from '@/lib/blend-the-word/types'
import PhonicsLockedEmpty from '@/features/learning/components/PhonicsLockedEmpty'

type Props = {
  words: BlendWord[]
  masteredKeys?: string[]
  successAudio: string
  errorAudio: string
}

type Win = {
  word: BlendWord
  points: number | null
  already: boolean
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function choicesFor(words: BlendWord[], target: BlendWord): BlendWord[] {
  const others = shuffle(words.filter((word) => word.id !== target.id)).slice(0, BLEND_WORD_CHOICES - 1)
  return shuffle([target, ...others])
}

export default function BlendWordPlay({
  words,
  masteredKeys = [],
  successAudio,
  errorAudio,
}: Props) {
  const [heard, setHeard] = useState<string[]>([])
  const [target, setTarget] = useState<BlendWord | null>(null)
  const [choices, setChoices] = useState<BlendWord[]>([])
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
      const unseen = words.filter((word) => word.id !== excludeId && !mastered.has(word.id))
      const others = words.filter((word) => word.id !== excludeId)
      const pool = unseen.length > 0 ? unseen : others.length > 0 ? others : words
      if (pool.length === 0) return null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [words, mastered]
  )

  const playBlend = useCallback((word: BlendWord) => {
    playVowelWordsSequence([
      { src: word.audio.sounds, fallbackText: word.speak.sounds },
      { src: word.audio.word, fallbackText: word.speak.word },
    ])
  }, [])

  const ask = useCallback(
    (word: BlendWord) => {
      stopVowelWordsAudio()
      setTarget(word)
      setChoices(choicesFor(words, word))
      setWrongId(null)
      setWin(null)
      setChecking(false)
      writeBlendWordSession({ wordId: word.id, word: word.word })
      playBlend(word)
    },
    [playBlend, words]
  )

  useEffect(() => {
    const first = pickNext()
    if (first) ask(first)
    return () => stopVowelWordsAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const choose = (word: BlendWord) => {
    if (!target || checking || win) return
    if (word.id !== target.id) {
      setWrongId(word.id)
      playVowelWordsAudio(errorAudio, { fallbackText: 'Try again' })
      return
    }
    setChecking(true)
    setWrongId(null)
    setWin({ word: target, points: 2, already: false })
    playVowelWordsAudio(successAudio, { fallbackText: `Great! ${target.word}` })
    void api
      .post<{ awarded?: boolean; points?: number }>('/api/learning/blend-the-word/celebrate', {
        wordId: target.id,
      })
      .then((res) => {
        setWin((prev) => {
          if (!prev || prev.word.id !== target.id) return prev
          if (res.awarded) return { ...prev, points: res.points ?? 2, already: false }
          return { ...prev, points: null, already: true }
        })
      })
      .catch(() => undefined)
    setHeard((prev) => (prev.includes(target.id) ? prev : [...prev, target.id]))
    const next = pickNext(target.id)
    window.setTimeout(() => {
      if (next) ask(next)
    }, 2200)
  }

  if (words.length === 0) {
    return (
      <PhonicsLockedEmpty
        title="Earn your SATPIN star first"
        detail="Catch every s a t p i n balloon to unlock blend packs. Stickers open the next words."
        cardClassName={blendWordTheme.card}
        btnClassName={blendWordTheme.btnPrimary}
      />
    )
  }

  if (!target) {
    return (
      <p className={`${blendWordTheme.card} py-12 text-center font-semibold text-[#d6d3d1]`}>
        No words to blend yet.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className={`${blendWordTheme.card} space-y-4 p-6 text-center sm:p-8`}>
        <p className="text-sm font-bold uppercase tracking-widest text-sky-300">Short a</p>
        <h2 className="text-2xl font-extrabold text-[#fafaf9] sm:text-3xl">Blend the word</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[#d6d3d1] sm:text-base">
          Hear each sound, then the whole word. Tap the picture that matches.
        </p>
      </section>

      <section className="space-y-4 text-center">
        {win ? (
          <div className="space-y-3" aria-live="polite">
            <p className="text-4xl motion-safe:animate-bounce" aria-hidden>
              🎉🔤⭐
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
            <p className="text-4xl font-black tracking-wide text-[#fafaf9]">{win.word.word}</p>
            <p className="text-sm font-bold text-sky-300">Next word…</p>
          </div>
        ) : (
          <button type="button" onClick={() => playBlend(target)} className={`${blendWordTheme.btnPrimary} px-6 py-3`}>
            Hear it again
          </button>
        )}

        <div className="grid grid-cols-3 gap-3" aria-label="Picture choices">
          {choices.map((word) => {
            const isWrong = wrongId === word.id
            const isWin = win?.word.id === word.id
            return (
              <button
                key={word.id}
                type="button"
                onClick={() => choose(word)}
                disabled={checking}
                className={`${blendWordTheme.card} p-2 transition active:scale-95 sm:p-3 ${
                  isWin
                    ? 'ring-4 ring-amber-300'
                    : isWrong
                      ? 'ring-4 ring-rose-300'
                      : 'hover:ring-2 hover:ring-sky-300'
                }`}
              >
                <WordPicture
                  src={word.image}
                  word={word.word}
                  alt={isWin ? word.word : 'Picture choice'}
                  className="aspect-square w-full rounded-2xl"
                  sizes="(max-width: 640px) 30vw, 200px"
                />
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
