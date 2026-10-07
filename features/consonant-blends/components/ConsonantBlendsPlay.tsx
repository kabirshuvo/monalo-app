'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import { consonantBlendsTheme } from '@/features/consonant-blends/consonant-blends-theme'
import {
  playVowelWordsAudio,
  playVowelWordsSequence,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import { writeConsonantBlendsSession } from '@/lib/consonant-blends/session'
import {
  resolveConsonantBlendAsset,
  type ConsonantBlendWord,
} from '@/lib/consonant-blends/constants'
import PhonicsLockedEmpty from '@/features/learning/components/PhonicsLockedEmpty'
import { ECO_PENGUIN_MASTERY_HITS } from '@/lib/learning/cambridge-esl'
import { recordMasteryHit } from '@/lib/learning/spaced-mastery'

type Props = {
  words: ConsonantBlendWord[]
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

export default function ConsonantBlendsPlay({
  words,
  masteredKeys = [],
  locked = false,
}: Props) {
  const [heard, setHeard] = useState<string[]>([])
  const [target, setTarget] = useState<ConsonantBlendWord | null>(null)
  const [choices, setChoices] = useState<ConsonantBlendWord[]>([])
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [win, setWin] = useState(false)
  const [checking, setChecking] = useState(false)
  const [hitHint, setHitHint] = useState<string | null>(null)

  const mastered = useMemo(() => {
    const set = new Set(masteredKeys)
    for (const id of heard) set.add(id)
    return set
  }, [masteredKeys, heard])

  const successAudio = resolveConsonantBlendAsset('/audio/success.mp3')
  const errorAudio = resolveConsonantBlendAsset('/audio/error.mp3')

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
    (word: ConsonantBlendWord) => {
      stopVowelWordsAudio()
      const others = shuffle(words.filter((w) => w.id !== word.id)).slice(0, 2)
      setTarget(word)
      setChoices(shuffle([word, ...others]))
      setWrongId(null)
      setWin(false)
      setChecking(false)
      setHitHint(null)
      writeConsonantBlendsSession({ wordId: word.id, word: word.word })
      playVowelWordsSequence([
        { src: word.audio.blend, fallbackText: word.speak.blend },
        { src: word.audio.word, fallbackText: word.speak.word },
      ])
    },
    [words]
  )

  useEffect(() => {
    if (locked || words.length === 0) return
    const first = pickNext()
    if (first) ask(first)
    return () => stopVowelWordsAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (locked) {
    return (
      <PhonicsLockedEmpty
        title="Earn your MDGOCK star first"
        detail="Catch every m d g o c k balloon, then practise adjacent consonants like st, fr, and nd."
        cardClassName={consonantBlendsTheme.card}
        btnClassName={consonantBlendsTheme.btnPrimary}
      />
    )
  }

  if (!target) {
    return (
      <p className={`${consonantBlendsTheme.card} py-12 text-center font-semibold text-[#d6d3d1]`}>
        No blend words yet.
      </p>
    )
  }

  const choose = (word: ConsonantBlendWord) => {
    if (checking || win) return
    if (word.id !== target.id) {
      setWrongId(word.id)
      playVowelWordsAudio(errorAudio, { fallbackText: 'Try again' })
      return
    }
    setChecking(true)
    setWin(true)
    const result = recordMasteryHit('consonant-blends', target.id)
    if (result.justMastered) {
      playVowelWordsAudio(successAudio, { fallbackText: `Great! ${target.word}` })
      void api
        .post('/api/learning/consonant-blends/celebrate', { wordId: target.id })
        .catch(() => undefined)
      setHeard((prev) => (prev.includes(target.id) ? prev : [...prev, target.id]))
      setHitHint('+2 points! Next blend…')
    } else if (result.alreadyMastered) {
      playVowelWordsAudio(successAudio, { fallbackText: `Great! ${target.word}` })
      setHitHint('Already mastered — keep practising!')
    } else {
      playVowelWordsAudio(successAudio, { fallbackText: 'Good! One more time.' })
      setHitHint(`Nice! ${result.hits}/${ECO_PENGUIN_MASTERY_HITS} to master`)
    }
    const next = pickNext(target.id)
    window.setTimeout(() => {
      if (next) ask(next)
    }, 1800)
  }

  return (
    <div className="space-y-6">
      <section className={`${consonantBlendsTheme.card} space-y-3 p-6 text-center sm:p-8`}>
        <p className="text-sm font-bold uppercase tracking-widest text-orange-300">
          Blend · {target.blend}
        </p>
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">Which picture matches?</h2>
        <button
          type="button"
          onClick={() =>
            playVowelWordsSequence([
              { src: target.audio.blend, fallbackText: target.speak.blend },
              { src: target.audio.word, fallbackText: target.speak.word },
            ])
          }
          className={`${consonantBlendsTheme.btnPrimary} px-6 py-3`}
        >
          Hear again
        </button>
      </section>
      {win ? (
        <p className="text-center text-sm font-bold text-orange-300" aria-live="polite">
          {hitHint ?? 'Next blend…'}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3" aria-label="Picture choices">
          {choices.map((word) => (
            <button
              key={word.id}
              type="button"
              disabled={checking}
              onClick={() => choose(word)}
              className={`${consonantBlendsTheme.card} p-2 transition active:scale-95 sm:p-3 ${
                wrongId === word.id ? 'ring-4 ring-rose-300' : 'hover:ring-2 hover:ring-orange-300'
              }`}
            >
              <WordPicture
                src={word.image}
                word={word.word}
                alt="Picture choice"
                className="aspect-square w-full rounded-2xl"
                sizes="(max-width: 640px) 30vw, 200px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
