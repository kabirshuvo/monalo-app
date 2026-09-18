'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import { VowelHighlight } from '@/features/vowel-words/components/VowelHighlight'
import { buildWordTheme } from '@/features/build-word/build-word-theme'
import {
  buildLetterTiles,
  writeBuildWordSession,
} from '@/lib/build-word/session'
import {
  playVowelWordsAudio,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import type { VowelMeta, VowelWord } from '@/lib/vowel-words/types'

type Props = {
  vowel: VowelMeta
  words: VowelWord[]
  masteredKeys?: string[]
}

type Tile = { id: string; letter: string; used: boolean }

type Win = {
  word: VowelWord
  points: number | null
  already: boolean
}

export default function BuildWordPlay({ vowel, words, masteredKeys = [] }: Props) {
  const [spelled, setSpelled] = useState<string[]>([])
  const mastered = useMemo(() => {
    const set = new Set(masteredKeys)
    for (const slug of spelled) set.add(`${vowel.id}:${slug}`)
    return set
  }, [masteredKeys, spelled, vowel.id])

  const prefer = useMemo(
    () => words.filter((w) => !mastered.has(`${vowel.id}:${w.slug}`)),
    [words, mastered, vowel.id]
  )

  const pickNext = useCallback(
    (excludeSlug?: string) => {
      const unseen = prefer.filter((w) => w.slug !== excludeSlug)
      const others = words.filter((w) => w.slug !== excludeSlug)
      const pool = unseen.length > 0 ? unseen : others.length > 0 ? others : words
      if (pool.length === 0) return null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [prefer, words]
  )

  const [target, setTarget] = useState<VowelWord | null>(null)
  const [tiles, setTiles] = useState<Tile[]>([])
  const [slots, setSlots] = useState<(string | null)[]>([])
  const [slotTileIds, setSlotTileIds] = useState<(string | null)[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [win, setWin] = useState<Win | null>(null)

  const startWord = useCallback(
    (word: VowelWord) => {
      stopVowelWordsAudio()
      setTarget(word)
      setMessage(null)
      setChecking(false)
      setWin(null)
      const letters = buildLetterTiles(word.word, 2)
      setTiles(letters.map((letter, i) => ({ id: `${letter}-${i}-${Math.random()}`, letter, used: false })))
      setSlots(Array(word.word.length).fill(null))
      setSlotTileIds(Array(word.word.length).fill(null))
      writeBuildWordSession({
        vowelId: vowel.id,
        vowelLabel: vowel.label,
        wordSlug: word.slug,
      })
      playVowelWordsAudio(word.audio.word, { fallbackText: word.speakWord })
    },
    [vowel.id, vowel.label]
  )

  useEffect(() => {
    const first = pickNext()
    if (first) startWord(first)
    return () => stopVowelWordsAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filledCount = slots.filter(Boolean).length

  const tapTile = (tile: Tile) => {
    if (tile.used || checking || !target) return
    const empty = slots.findIndex((s) => s === null)
    if (empty < 0) return
    setTiles((prev) => prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t)))
    setSlots((prev) => {
      const next = [...prev]
      next[empty] = tile.letter
      return next
    })
    setSlotTileIds((prev) => {
      const next = [...prev]
      next[empty] = tile.id
      return next
    })
    setMessage(null)
  }

  const backspace = () => {
    if (checking) return
    let last = -1
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i] !== null) {
        last = i
        break
      }
    }
    if (last < 0) return
    const tileId = slotTileIds[last]
    setSlots((prev) => {
      const next = [...prev]
      next[last] = null
      return next
    })
    setSlotTileIds((prev) => {
      const next = [...prev]
      next[last] = null
      return next
    })
    if (tileId) {
      setTiles((prev) => prev.map((t) => (t.id === tileId ? { ...t, used: false } : t)))
    }
  }

  const clearAll = () => {
    if (checking || !target) return
    setTiles((prev) => prev.map((t) => ({ ...t, used: false })))
    setSlots(Array(target.word.length).fill(null))
    setSlotTileIds(Array(target.word.length).fill(null))
    setMessage(null)
  }

  const check = () => {
    if (!target || checking) return
    const guess = slots.join('')
    if (guess.length !== target.word.length) {
      setMessage('Fill every letter box')
      return
    }
    setChecking(true)
    if (guess === target.word.toLowerCase()) {
      const spelledWord = target
      setWin({ word: spelledWord, points: 2, already: false })
      playVowelWordsAudio(spelledWord.audio.success, {
        fallbackText: `Great! ${spelledWord.speakWord}`,
      })
      void api
        .post<{ awarded?: boolean; points?: number }>('/api/learning/build-the-word/celebrate', {
          vowelId: vowel.id,
          wordSlug: spelledWord.slug,
        })
        .then((res) => {
          setWin((prev) => {
            if (!prev || prev.word.slug !== spelledWord.slug) return prev
            if (res.awarded) return { ...prev, points: res.points ?? 2, already: false }
            return { ...prev, points: null, already: true }
          })
        })
        .catch(() => undefined)
      setSpelled((prev) =>
        prev.includes(spelledWord.slug) ? prev : [...prev, spelledWord.slug]
      )
      const next = pickNext(spelledWord.slug)
      window.setTimeout(() => {
        if (next) startWord(next)
        else {
          setWin(null)
          setChecking(false)
        }
      }, 2200)
    } else {
      setMessage('Not quite — try again')
      playVowelWordsAudio(target.audio.error, { fallbackText: 'Try again' })
      setChecking(false)
    }
  }

  if (!target) {
    return (
      <p className={`${buildWordTheme.cardSoft} py-12 text-center font-semibold text-[#d6d3d1]`}>
        No words to spell yet.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {win && (
        <div className="flex flex-col items-center gap-3" aria-live="polite">
          <p className="text-4xl motion-safe:animate-bounce" aria-hidden>
            🎉🔤⭐
          </p>
          {win.points !== null && (
            <p className="rounded-full bg-amber-400/20 px-5 py-2 text-sm font-extrabold text-[#fafaf9] shadow-sm">
              +{win.points} points!
            </p>
          )}
          {win.already && (
            <p className="rounded-full bg-sky-400/20 px-5 py-2 text-sm font-extrabold text-sky-200 shadow-sm">
              You&apos;ve spelled this one!
            </p>
          )}
        </div>
      )}

      <div className={`${buildWordTheme.card} mx-auto max-w-md space-y-4 p-5 text-center sm:p-6`}>
        <WordPicture
          src={target.image}
          word={target.word}
          className="mx-auto aspect-square w-40 rounded-2xl sm:w-48"
          sizes="200px"
        />
        {win ? (
          <>
            <h2 className="text-4xl font-extrabold text-[#fafaf9]">
              <VowelHighlight graphemes={win.word.graphemes} vowelLetter={vowel.letter} />
            </h2>
            <p className="text-sm font-bold text-rose-200">Great spelling!</p>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() =>
                playVowelWordsAudio(target.audio.word, { fallbackText: target.speakWord })
              }
              className={`${buildWordTheme.btnPrimary} px-6 py-3`}
            >
              🔊 Hear the word
            </button>
            <p className="text-xs font-medium text-sky-300/80">
              Spelling for short {vowel.letter} — boxes only, no peeking
            </p>
          </>
        )}
      </div>

      {!win && (
        <>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {slots.map((letter, i) => (
              <div key={i} className={buildWordTheme.slot}>
                {letter ?? ''}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                disabled={tile.used || checking}
                onClick={() => tapTile(tile)}
                className={`${buildWordTheme.tile} ${tile.used ? 'opacity-30' : 'hover:border-sky-400'}`}
              >
                {tile.letter}
              </button>
            ))}
          </div>

          {message && (
            <p className="text-center text-sm font-extrabold text-rose-100">{message}</p>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={backspace} className={buildWordTheme.btnSecondary}>
              ⌫ Back
            </button>
            <button type="button" onClick={clearAll} className={buildWordTheme.btnSecondary}>
              Clear
            </button>
            <button
              type="button"
              onClick={check}
              disabled={filledCount < target.word.length || checking}
              className={buildWordTheme.btnPrimary}
            >
              Check spelling
            </button>
          </div>
        </>
      )}

      {win && <p className="text-center text-sm font-bold text-rose-200">Next word…</p>}
    </div>
  )
}
