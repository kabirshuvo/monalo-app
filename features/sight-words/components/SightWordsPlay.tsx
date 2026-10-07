'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { sightWordsTheme } from '@/features/sight-words/sight-words-theme'
import {
  playVowelWordsAudio,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import { writeSightWordsSession } from '@/lib/sight-words/session'
import type { SightSentence, SightWord } from '@/lib/sight-words/constants'
import PhonicsLockedEmpty from '@/features/learning/components/PhonicsLockedEmpty'
import { ECO_PENGUIN_MASTERY_HITS } from '@/lib/learning/cambridge-esl'
import { recordMasteryHit } from '@/lib/learning/spaced-mastery'

type Mode = 'word' | 'sentence'

type Props = {
  words: SightWord[]
  sentences?: SightSentence[]
  masteredKeys?: string[]
  locked?: boolean
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export default function SightWordsPlay({
  words,
  sentences = [],
  masteredKeys = [],
  locked = false,
}: Props) {
  const [mode, setMode] = useState<Mode>('word')
  const [heard, setHeard] = useState<string[]>([])
  const [target, setTarget] = useState<SightWord | null>(null)
  const [sentence, setSentence] = useState<SightSentence | null>(null)
  const [choices, setChoices] = useState<(SightWord | string)[]>([])
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [win, setWin] = useState(false)
  const [checking, setChecking] = useState(false)
  const [hitHint, setHitHint] = useState<string | null>(null)

  const mastered = useMemo(() => {
    const set = new Set(masteredKeys)
    for (const id of heard) set.add(id)
    return set
  }, [masteredKeys, heard])

  const pickNextWord = useCallback(
    (excludeId?: string) => {
      const unseen = words.filter((w) => w.id !== excludeId && !mastered.has(w.id))
      const pool = unseen.length > 0 ? unseen : words.filter((w) => w.id !== excludeId)
      if (pool.length === 0) return words[0] ?? null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [words, mastered]
  )

  const pickNextSentence = useCallback(
    (excludeId?: string) => {
      if (sentences.length === 0) return null
      const unseen = sentences.filter((s) => s.id !== excludeId && !mastered.has(`sent:${s.id}`))
      const pool = unseen.length > 0 ? unseen : sentences.filter((s) => s.id !== excludeId)
      if (pool.length === 0) return sentences[0] ?? null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [sentences, mastered]
  )

  const askWord = useCallback(
    (word: SightWord) => {
      stopVowelWordsAudio()
      const others = shuffle(words.filter((w) => w.id !== word.id)).slice(0, 2)
      setTarget(word)
      setSentence(null)
      setChoices(shuffle([word, ...others]))
      setWrongId(null)
      setWin(false)
      setChecking(false)
      setHitHint(null)
      writeSightWordsSession({ wordId: word.id, word: word.word })
      playVowelWordsAudio(word.audio ?? '', { fallbackText: word.speak })
    },
    [words]
  )

  const askSentence = useCallback((s: SightSentence) => {
    stopVowelWordsAudio()
    setSentence(s)
    setTarget(null)
    setChoices(shuffle(s.choices))
    setWrongId(null)
    setWin(false)
    setChecking(false)
    setHitHint(null)
    writeSightWordsSession({ wordId: s.sightId, word: s.words[s.blankIndex] ?? s.sightId })
    playVowelWordsAudio(s.audio ?? '', { fallbackText: s.speak })
  }, [])

  useEffect(() => {
    if (locked || words.length === 0) return
    if (mode === 'sentence' && sentences.length > 0) {
      const first = pickNextSentence()
      if (first) askSentence(first)
    } else {
      const first = pickNextWord()
      if (first) askWord(first)
    }
    return () => stopVowelWordsAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  if (locked) {
    return (
      <PhonicsLockedEmpty
        title="Earn your SATPIN star first"
        detail="Catch every s a t p i n balloon, then practise Stage 1 sight words like the, is, and can."
        cardClassName={sightWordsTheme.card}
        btnClassName={sightWordsTheme.btnPrimary}
      />
    )
  }

  const switchMode = (next: Mode) => {
    if (next === mode) return
    setMode(next)
  }

  const onCorrectWord = (word: SightWord) => {
    setChecking(true)
    const result = recordMasteryHit('sight-words', word.id)
    if (result.justMastered || result.alreadyMastered) {
      setWin(true)
      playVowelWordsAudio('/sight-words/audio/success.mp3', {
        fallbackText: `Great! ${word.word}`,
      })
      if (result.justMastered) {
        void api.post('/api/learning/sight-words/celebrate', { wordId: word.id }).catch(() => undefined)
        setHeard((prev) => (prev.includes(word.id) ? prev : [...prev, word.id]))
      }
      setHitHint(result.alreadyMastered ? 'Already mastered — keep practising!' : '+2 points! Next…')
    } else {
      setWin(true)
      playVowelWordsAudio('/sight-words/audio/success.mp3', { fallbackText: 'Good! One more time.' })
      setHitHint(`Nice! ${result.hits}/${ECO_PENGUIN_MASTERY_HITS} to master`)
    }
    const next = pickNextWord(word.id)
    window.setTimeout(() => {
      if (next) askWord(next)
    }, 1600)
  }

  const onCorrectSentence = (s: SightSentence) => {
    setChecking(true)
    const result = recordMasteryHit('sight-sentence', s.id)
    if (result.justMastered || result.alreadyMastered) {
      setWin(true)
      playVowelWordsAudio('/sight-words/audio/success.mp3', { fallbackText: 'Great reading!' })
      if (result.justMastered) {
        void api
          .post('/api/learning/sight-words/celebrate', { wordId: s.sightId, sentenceId: s.id })
          .catch(() => undefined)
        setHeard((prev) => (prev.includes(`sent:${s.id}`) ? prev : [...prev, `sent:${s.id}`]))
      }
      setHitHint(result.alreadyMastered ? 'Already mastered — keep reading!' : '+2 points! Next…')
    } else {
      setWin(true)
      playVowelWordsAudio('/sight-words/audio/success.mp3', { fallbackText: 'Good! One more time.' })
      setHitHint(`Nice! ${result.hits}/${ECO_PENGUIN_MASTERY_HITS} to master`)
    }
    const next = pickNextSentence(s.id)
    window.setTimeout(() => {
      if (next) askSentence(next)
    }, 1600)
  }

  const chooseWord = (word: SightWord) => {
    if (checking || win || !target) return
    if (word.id !== target.id) {
      setWrongId(word.id)
      playVowelWordsAudio('/sight-words/audio/error.mp3', { fallbackText: 'Try again' })
      return
    }
    onCorrectWord(word)
  }

  const chooseSentenceChoice = (choice: string) => {
    if (checking || win || !sentence) return
    const answer = sentence.words[sentence.blankIndex]
    if (choice.toLowerCase() !== answer.toLowerCase()) {
      setWrongId(choice)
      playVowelWordsAudio('/sight-words/audio/error.mp3', { fallbackText: 'Try again' })
      return
    }
    onCorrectSentence(sentence)
  }

  if (mode === 'word' && !target) {
    return (
      <p className={`${sightWordsTheme.card} py-12 text-center font-semibold text-[#d6d3d1]`}>
        No sight words yet.
      </p>
    )
  }

  if (mode === 'sentence' && !sentence) {
    return (
      <p className={`${sightWordsTheme.card} py-12 text-center font-semibold text-[#d6d3d1]`}>
        No sentences yet.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => switchMode('word')}
          className={`rounded-2xl px-4 py-2 text-sm font-bold ${
            mode === 'word'
              ? sightWordsTheme.btnPrimary
              : `${sightWordsTheme.btnSecondary} opacity-90`
          }`}
        >
          Hear & tap
        </button>
        {sentences.length > 0 && (
          <button
            type="button"
            onClick={() => switchMode('sentence')}
            className={`rounded-2xl px-4 py-2 text-sm font-bold ${
              mode === 'sentence'
                ? sightWordsTheme.btnPrimary
                : `${sightWordsTheme.btnSecondary} opacity-90`
            }`}
          >
            Read a sentence
          </button>
        )}
      </div>

      {mode === 'word' && target && (
        <>
          <section className={`${sightWordsTheme.card} space-y-3 p-6 text-center sm:p-8`}>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-300">Sight words</p>
            <h2 className="text-2xl font-extrabold text-[#fafaf9]">Hear the word. Tap it.</h2>
            <button
              type="button"
              onClick={() =>
                playVowelWordsAudio(target.audio ?? '', { fallbackText: target.speak })
              }
              className={`${sightWordsTheme.btnPrimary} px-6 py-3`}
            >
              Hear again
            </button>
          </section>
          {win ? (
            <p className="text-center text-sm font-bold text-amber-300" aria-live="polite">
              {hitHint ?? 'Next word…'}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3" aria-label="Word choices">
              {(choices as SightWord[]).map((word) => (
                <button
                  key={word.id}
                  type="button"
                  disabled={checking}
                  onClick={() => chooseWord(word)}
                  className={`${sightWordsTheme.card} px-3 py-8 text-2xl font-black text-[#fafaf9] transition active:scale-95 sm:text-3xl ${
                    wrongId === word.id ? 'ring-4 ring-rose-300' : 'hover:ring-2 hover:ring-amber-300'
                  }`}
                >
                  {word.word}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {mode === 'sentence' && sentence && (
        <>
          <section className={`${sightWordsTheme.card} space-y-4 p-6 text-center sm:p-8`}>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-300">
              Read a sentence
            </p>
            <p className="text-2xl font-extrabold leading-snug text-[#fafaf9] sm:text-3xl">
              {sentence.words.map((w, i) =>
                i === sentence.blankIndex ? (
                  <span key={`${w}-${i}`} className="mx-1 inline-block min-w-[3ch] border-b-4 border-amber-300 text-amber-200">
                    ___
                  </span>
                ) : (
                  <span key={`${w}-${i}`} className="mx-1">
                    {w}
                  </span>
                )
              )}
            </p>
            <button
              type="button"
              onClick={() =>
                playVowelWordsAudio(sentence.audio ?? '', { fallbackText: sentence.speak })
              }
              className={`${sightWordsTheme.btnPrimary} px-6 py-3`}
            >
              Hear the sentence
            </button>
          </section>
          {win ? (
            <p className="text-center text-sm font-bold text-amber-300" aria-live="polite">
              {hitHint ?? 'Next sentence…'}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3" aria-label="Word choices">
              {(choices as string[]).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  disabled={checking}
                  onClick={() => chooseSentenceChoice(choice)}
                  className={`${sightWordsTheme.card} px-3 py-8 text-2xl font-black text-[#fafaf9] transition active:scale-95 sm:text-3xl ${
                    wrongId === choice ? 'ring-4 ring-rose-300' : 'hover:ring-2 hover:ring-amber-300'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
