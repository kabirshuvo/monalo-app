'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import { VowelHighlight } from '@/features/vowel-words/components/VowelHighlight'
import { buildWordTheme } from '@/features/build-word/build-word-theme'
import {
  BUILD_WORD_BASE_PATH,
  buildLetterTiles,
  writeBuildWordSession,
} from '@/lib/build-word/session'
import {
  playVowelWordsAudio,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import type { VowelMeta, VowelWord } from '@/lib/vowel-words/types'

type Props = {
  vowel: VowelMeta
  words: VowelWord[]
  masteredKeys?: string[]
}

type Tile = { id: string; letter: string; used: boolean }

export default function BuildWordPlay({ vowel, words, masteredKeys = [] }: Props) {
  const router = useRouter()
  const mastered = useMemo(() => new Set(masteredKeys), [masteredKeys])

  const prefer = useMemo(
    () => words.filter((w) => !mastered.has(`${vowel.id}:${w.slug}`)),
    [words, mastered, vowel.id]
  )

  const pickNext = useCallback(() => {
    const pool = prefer.length > 0 ? prefer : words
    if (pool.length === 0) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }, [prefer, words])

  const [target, setTarget] = useState<VowelWord | null>(null)
  const [tiles, setTiles] = useState<Tile[]>([])
  const [slots, setSlots] = useState<(string | null)[]>([])
  const [slotTileIds, setSlotTileIds] = useState<(string | null)[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const startWord = useCallback(
    (word: VowelWord) => {
      stopVowelWordsAudio()
      setTarget(word)
      setMessage(null)
      setChecking(false)
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
      setMessage('Great spelling!')
      playVowelWordsAudio(target.audio.success, { fallbackText: `Great! ${target.speakWord}` })
      window.setTimeout(() => {
        router.push(
          `${BUILD_WORD_BASE_PATH}/${vowel.id}/${target.slug}?celebrate=1`
        )
      }, 600)
    } else {
      setMessage('Not quite — try again')
      playVowelWordsAudio(target.audio.error, { fallbackText: 'Try again' })
      setChecking(false)
    }
  }

  if (!target) {
    return (
      <p className={`${buildWordTheme.cardSoft} py-12 text-center font-semibold text-sky-800`}>
        No words to spell yet.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className={`${buildWordTheme.card} mx-auto max-w-md space-y-4 p-5 text-center sm:p-6`}>
        <WordPicture
          src={target.image}
          word={target.word}
          className="mx-auto aspect-square w-40 rounded-2xl sm:w-48"
          sizes="200px"
        />
        <button
          type="button"
          onClick={() =>
            playVowelWordsAudio(target.audio.word, { fallbackText: target.speakWord })
          }
          className={`${buildWordTheme.btnPrimary} px-6 py-3`}
        >
          🔊 Hear the word
        </button>
        <p className="text-xs font-medium text-sky-700/80">
          Spelling for short {vowel.letter} — boxes only, no peeking
        </p>
      </div>

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
        <p className="text-center text-sm font-extrabold text-indigo-800">{message}</p>
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

      <p className="text-center text-xs text-sky-700/70">
        Parent tip: after a win you can show{' '}
        <VowelHighlight graphemes={target.graphemes} vowelLetter={vowel.letter} />
      </p>
    </div>
  )
}
