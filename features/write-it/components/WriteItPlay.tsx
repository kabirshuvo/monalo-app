'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LetterTracePad, {
  type LetterTracePadHandle,
} from '@/features/write-it/components/LetterTracePad'
import { writeItTheme } from '@/features/write-it/write-it-theme'
import {
  playVowelWordsAudio,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import { writeWriteItSession } from '@/lib/write-it/session'
import type { WriteItLetter, WriteItSentence } from '@/lib/write-it/constants'
import PhonicsLockedEmpty from '@/features/learning/components/PhonicsLockedEmpty'
import { ECO_PENGUIN_MASTERY_HITS } from '@/lib/learning/cambridge-esl'
import { recordMasteryHit } from '@/lib/learning/spaced-mastery'

type Mode = 'sentence' | 'trace'

type Props = {
  sentences: WriteItSentence[]
  letters: WriteItLetter[]
  masteredKeys?: string[]
  locked?: boolean
}

type BankTile = { id: string; word: string; used: boolean }

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export default function WriteItPlay({
  sentences,
  letters,
  masteredKeys = [],
  locked = false,
}: Props) {
  const [mode, setMode] = useState<Mode>('sentence')
  const [heard, setHeard] = useState<string[]>([])
  const [sentence, setSentence] = useState<WriteItSentence | null>(null)
  const [bank, setBank] = useState<BankTile[]>([])
  const [built, setBuilt] = useState<string[]>([])
  const [letter, setLetter] = useState<WriteItLetter | null>(null)
  const [hasInk, setHasInk] = useState(false)
  const [traceFeedback, setTraceFeedback] = useState<string | null>(null)
  const [traceScoreLabel, setTraceScoreLabel] = useState<string | null>(null)
  const tracePadRef = useRef<LetterTracePadHandle | null>(null)
  const [win, setWin] = useState(false)
  const [checking, setChecking] = useState(false)
  const [hitHint, setHitHint] = useState<string | null>(null)
  const [wrong, setWrong] = useState(false)

  const mastered = useMemo(() => {
    const set = new Set(masteredKeys)
    for (const id of heard) set.add(id)
    return set
  }, [masteredKeys, heard])

  const pickSentence = useCallback(
    (excludeId?: string) => {
      const unseen = sentences.filter((s) => s.id !== excludeId && !mastered.has(`sent:${s.id}`))
      const pool = unseen.length > 0 ? unseen : sentences.filter((s) => s.id !== excludeId)
      if (pool.length === 0) return sentences[0] ?? null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [sentences, mastered]
  )

  const pickLetter = useCallback(
    (excludeId?: string) => {
      const unseen = letters.filter((l) => l.id !== excludeId && !mastered.has(`trace:${l.id}`))
      const pool = unseen.length > 0 ? unseen : letters.filter((l) => l.id !== excludeId)
      if (pool.length === 0) return letters[0] ?? null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [letters, mastered]
  )

  const askSentence = useCallback((s: WriteItSentence) => {
    stopVowelWordsAudio()
    setSentence(s)
    setLetter(null)
    setBuilt([])
    setWrong(false)
    setWin(false)
    setChecking(false)
    setHitHint(null)
    const words = shuffle([...s.words, ...s.distractors])
    setBank(words.map((w, i) => ({ id: `${w}-${i}-${Math.random()}`, word: w, used: false })))
    writeWriteItSession({ mode: 'sentence', itemId: s.id, label: s.speak })
    playVowelWordsAudio(s.audio ?? '', { fallbackText: s.speak })
  }, [])

  const askLetter = useCallback((l: WriteItLetter) => {
    stopVowelWordsAudio()
    setLetter(l)
    setSentence(null)
    setHasInk(false)
    setWin(false)
    setChecking(false)
    setHitHint(null)
    setTraceFeedback(null)
    setTraceScoreLabel(null)
    writeWriteItSession({ mode: 'trace', itemId: l.id, label: l.letter })
    playVowelWordsAudio(l.audio ?? '', { fallbackText: l.speak })
    window.setTimeout(() => {
      void tracePadRef.current?.playDemo()
    }, 500)
  }, [])

  useEffect(() => {
    if (locked) return
    if (mode === 'sentence') {
      const first = pickSentence()
      if (first) askSentence(first)
    } else {
      const first = pickLetter()
      if (first) askLetter(first)
    }
    return () => stopVowelWordsAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, locked])

  if (locked) {
    return (
      <PhonicsLockedEmpty
        title="Earn your SATPIN star first"
        detail="Catch every s a t p i n balloon, then build sentences and trace letters."
        cardClassName={writeItTheme.card}
        btnClassName={writeItTheme.btnPrimary}
      />
    )
  }

  const celebrate = (
    roomKey: string,
    itemId: string,
    celebrateBody: Record<string, string>,
    next: () => void
  ) => {
    setChecking(true)
    setWin(true)
    const result = recordMasteryHit(roomKey, itemId)
    if (result.justMastered) {
      playVowelWordsAudio('/write-it/audio/success.mp3', { fallbackText: 'Great writing!' })
      void api.post('/api/learning/write-it/celebrate', celebrateBody).catch(() => undefined)
      setHeard((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]))
      setHitHint('+2 points! Next…')
    } else if (result.alreadyMastered) {
      playVowelWordsAudio('/write-it/audio/success.mp3', { fallbackText: 'Great writing!' })
      setHitHint('Already practised — keep going!')
    } else {
      playVowelWordsAudio('/write-it/audio/success.mp3', { fallbackText: 'Good! One more time.' })
      setHitHint(`Nice! ${result.hits}/${ECO_PENGUIN_MASTERY_HITS} to master`)
    }
    window.setTimeout(next, 1600)
  }

  const tapBank = (tile: BankTile) => {
    if (!sentence || tile.used || checking || win) return
    const nextBuilt = [...built, tile.word]
    setBuilt(nextBuilt)
    setBank((prev) => prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t)))
    setWrong(false)

    if (nextBuilt.length < sentence.words.length) return

    const ok = nextBuilt.every((w, i) => w === sentence.words[i])
    if (!ok) {
      setWrong(true)
      playVowelWordsAudio('/write-it/audio/error.mp3', { fallbackText: 'Try again' })
      window.setTimeout(() => {
        setBuilt([])
        setBank((prev) => prev.map((t) => ({ ...t, used: false })))
        setWrong(false)
      }, 700)
      return
    }

    celebrate('write-sentence', `sent:${sentence.id}`, { kind: 'sentence', itemId: sentence.id }, () => {
      const following = pickSentence(sentence.id)
      if (following) askSentence(following)
    })
  }

  const undoBuilt = () => {
    if (!built.length || checking || win) return
    const last = built[built.length - 1]
    setBuilt((prev) => prev.slice(0, -1))
    setBank((prev) => {
      const copy = [...prev]
      const idx = copy.findIndex((t) => t.used && t.word === last)
      if (idx >= 0) copy[idx] = { ...copy[idx], used: false }
      return copy
    })
  }

  const finishTrace = () => {
    if (!letter || !hasInk || checking || win) return
    const result = tracePadRef.current?.score()
    if (!result) return
    setTraceScoreLabel(`${result.score}% on the letter`)
    if (!result.pass) {
      playVowelWordsAudio('/write-it/audio/error.mp3', { fallbackText: 'Try again' })
      setTraceFeedback(
        result.score === 0 || result.inkPixels < 80
          ? 'Draw more of the letter — follow the dots.'
          : 'Stay closer to the letter shape — watch first, then try again.'
      )
      return
    }
    setTraceFeedback(null)
    celebrate('write-trace', `trace:${letter.id}`, { kind: 'trace', itemId: letter.id }, () => {
      const following = pickLetter(letter.id)
      if (following) askLetter(following)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setMode('sentence')}
          className={`rounded-2xl px-4 py-2 text-sm font-bold ${
            mode === 'sentence' ? writeItTheme.btnPrimary : `${writeItTheme.btnSecondary} opacity-90`
          }`}
        >
          Sentence tiles
        </button>
        <button
          type="button"
          onClick={() => setMode('trace')}
          className={`rounded-2xl px-4 py-2 text-sm font-bold ${
            mode === 'trace' ? writeItTheme.btnPrimary : `${writeItTheme.btnSecondary} opacity-90`
          }`}
        >
          Trace a letter
        </button>
      </div>

      {mode === 'sentence' && sentence && (
        <>
          <section className={`${writeItTheme.card} space-y-3 p-6 text-center sm:p-8`}>
            <p className="text-sm font-bold uppercase tracking-widest text-rose-300">Build the sentence</p>
            <h2 className="text-xl font-extrabold text-[#fafaf9] sm:text-2xl">
              Hear it, then tap the word tiles in order.
            </h2>
            <button
              type="button"
              onClick={() =>
                playVowelWordsAudio(sentence.audio ?? '', { fallbackText: sentence.speak })
              }
              className={`${writeItTheme.btnPrimary} px-6 py-3`}
            >
              Hear the sentence
            </button>
          </section>

          <div
            className={`${writeItTheme.card} flex min-h-20 flex-wrap items-center justify-center gap-2 p-4 ${
              wrong ? 'ring-4 ring-rose-300' : ''
            }`}
            aria-label="Your sentence"
          >
            {built.length === 0 ? (
              <p className="text-sm text-[#a8a29e]">Tap tiles below…</p>
            ) : (
              built.map((w, i) => (
                <span
                  key={`${w}-${i}`}
                  className="rounded-2xl bg-[#fafaf9]/10 px-3 py-2 text-xl font-black text-[#fafaf9]"
                >
                  {w}
                </span>
              ))
            )}
          </div>

          {win ? (
            <p className="text-center text-sm font-bold text-rose-300" aria-live="polite">
              {hitHint ?? 'Next…'}
            </p>
          ) : (
            <>
              <div className="flex flex-wrap justify-center gap-2" aria-label="Word tiles">
                {bank.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    disabled={tile.used || checking}
                    onClick={() => tapBank(tile)}
                    className={`${writeItTheme.tile} ${tile.used ? 'opacity-30' : 'hover:ring-2 hover:ring-rose-300'}`}
                  >
                    {tile.word}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button type="button" onClick={undoBuilt} className={`${writeItTheme.btnSecondary} px-4 py-2`}>
                  Undo
                </button>
              </div>
            </>
          )}
        </>
      )}

      {mode === 'trace' && letter && (
        <>
          <section className={`${writeItTheme.card} space-y-3 p-6 text-center sm:p-8`}>
            <p className="text-sm font-bold uppercase tracking-widest text-rose-300">Trace a letter</p>
            <h2 className="text-xl font-extrabold text-[#fafaf9] sm:text-2xl">
              Finger-trace <span className="text-rose-300">{letter.letter}</span>
            </h2>
            <button
              type="button"
              onClick={() =>
                playVowelWordsAudio(letter.audio ?? '', { fallbackText: letter.speak })
              }
              className={`${writeItTheme.btnPrimary} px-6 py-3`}
            >
              Hear the sound
            </button>
          </section>
          <LetterTracePad
            ref={tracePadRef}
            letter={letter.letter}
            onHasInkChange={(ink) => {
              setHasInk(ink)
              if (ink) setTraceFeedback(null)
            }}
            disabled={checking || win}
          />
          {traceScoreLabel && !win && (
            <p className="text-center text-sm font-bold text-rose-200" aria-live="polite">
              {traceScoreLabel}
            </p>
          )}
          {traceFeedback && (
            <p className="text-center text-sm font-semibold text-amber-200" role="status">
              {traceFeedback}
            </p>
          )}
          {win ? (
            <p className="text-center text-sm font-bold text-rose-300" aria-live="polite">
              {hitHint ?? 'Next…'}
            </p>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                disabled={!hasInk || checking}
                onClick={finishTrace}
                className={`${writeItTheme.btnPrimary} min-h-12 px-8 py-3`}
              >
                Check my letter
              </button>
            </div>
          )}
          <p className="text-center text-xs text-[#a8a29e]">
            Watch the pink path, then draw on the letter (finger or stylus). Stay on the shape!
          </p>
        </>
      )}
    </div>
  )
}
