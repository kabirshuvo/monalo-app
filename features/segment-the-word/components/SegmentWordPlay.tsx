'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import { segmentWordTheme } from '@/features/segment-the-word/segment-word-theme'
import {
  playVowelWordsAudio,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import { writeSegmentWordSession } from '@/lib/segment-the-word/session'
import type { BlendWord } from '@/lib/blend-the-word/types'

type Props = {
  words: BlendWord[]
  masteredKeys?: string[]
  successAudio: string
  errorAudio: string
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export default function SegmentWordPlay({
  words,
  masteredKeys = [],
  successAudio,
  errorAudio,
}: Props) {
  const [heard, setHeard] = useState<string[]>([])
  const [target, setTarget] = useState<BlendWord | null>(null)
  const [tiles, setTiles] = useState<string[]>([])
  const [built, setBuilt] = useState<string[]>([])
  const [wrong, setWrong] = useState(false)
  const [win, setWin] = useState(false)
  const [checking, setChecking] = useState(false)

  const mastered = useMemo(() => {
    const set = new Set(masteredKeys)
    for (const id of heard) set.add(id)
    return set
  }, [masteredKeys, heard])

  const pickNext = useCallback(
    (excludeId?: string) => {
      const unseen = words.filter((w) => w.id !== excludeId && !mastered.has(w.id))
      const pool = unseen.length > 0 ? unseen : words.filter((w) => w.id !== excludeId)
      if (pool.length === 0) return words[0] ?? null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [words, mastered]
  )

  const ask = useCallback(
    (word: BlendWord) => {
      stopVowelWordsAudio()
      setTarget(word)
      setTiles(shuffle([...word.graphemes]))
      setBuilt([])
      setWrong(false)
      setWin(false)
      setChecking(false)
      writeSegmentWordSession({ wordId: word.id, word: word.word })
      playVowelWordsAudio(word.audio.word, { fallbackText: word.speak.word })
    },
    []
  )

  useEffect(() => {
    const first = pickNext()
    if (first) ask(first)
    return () => stopVowelWordsAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tapTile = (letter: string, index: number) => {
    if (!target || checking || win) return
    const expected = target.graphemes[built.length]
    if (letter !== expected) {
      setWrong(true)
      playVowelWordsAudio(errorAudio, { fallbackText: 'Try again' })
      window.setTimeout(() => setWrong(false), 400)
      return
    }
    const nextBuilt = [...built, letter]
    setBuilt(nextBuilt)
    setTiles((prev) => prev.filter((_, i) => i !== index))
    if (nextBuilt.length === target.graphemes.length) {
      setChecking(true)
      setWin(true)
      playVowelWordsAudio(successAudio, { fallbackText: `Great! ${target.word}` })
      void api
        .post('/api/learning/segment-the-word/celebrate', { wordId: target.id })
        .catch(() => undefined)
      setHeard((prev) => (prev.includes(target.id) ? prev : [...prev, target.id]))
      const next = pickNext(target.id)
      window.setTimeout(() => {
        if (next) ask(next)
      }, 2000)
    }
  }

  if (!target) {
    return (
      <p className={`${segmentWordTheme.card} py-12 text-center font-semibold text-[#d6d3d1]`}>
        No words to segment yet.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className={`${segmentWordTheme.card} space-y-3 p-6 text-center sm:p-8`}>
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-300">Segment</p>
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">Hear the word. Tap the sounds.</h2>
        <WordPicture
          src={target.image}
          word={target.word}
          className="mx-auto aspect-square w-40 rounded-3xl sm:w-48"
          sizes="200px"
        />
        <button
          type="button"
          onClick={() => playVowelWordsAudio(target.audio.word, { fallbackText: target.speak.word })}
          className={`${segmentWordTheme.btnPrimary} px-6 py-3`}
        >
          Hear the word
        </button>
      </section>

      <section className="space-y-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Sounds built">
          {target.graphemes.map((_, i) => (
            <span
              key={i}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#fafaf9]/25 bg-[#1c1917] text-2xl font-black text-[#fafaf9]"
            >
              {built[i] ?? '·'}
            </span>
          ))}
        </div>
        {win ? (
          <p className="text-sm font-bold text-emerald-300" aria-live="polite">
            +2 points! Next word…
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Sound tiles">
            {tiles.map((letter, index) => (
              <button
                key={`${letter}-${index}`}
                type="button"
                disabled={checking}
                onClick={() => tapTile(letter, index)}
                className={`${segmentWordTheme.card} h-14 min-w-14 px-3 text-2xl font-black text-[#fafaf9] transition active:scale-95 ${
                  wrong ? 'ring-2 ring-rose-400' : 'hover:ring-2 hover:ring-emerald-300'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
