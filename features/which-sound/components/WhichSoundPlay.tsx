'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import { whichSoundTheme } from '@/features/which-sound/which-sound-theme'
import {
  playVowelWordsAudio,
  playVowelWordsSequence,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import { writeWhichSoundSession } from '@/lib/which-sound/session'
import type { LetterSound } from '@/lib/letter-sounds/types'

type Props = {
  letters: LetterSound[]
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

export default function WhichSoundPlay({
  letters,
  masteredKeys = [],
  successAudio,
  errorAudio,
}: Props) {
  const [heard, setHeard] = useState<string[]>([])
  const [target, setTarget] = useState<LetterSound | null>(null)
  const [choices, setChoices] = useState<LetterSound[]>([])
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [win, setWin] = useState(false)
  const [checking, setChecking] = useState(false)

  const mastered = useMemo(() => {
    const set = new Set(masteredKeys)
    for (const id of heard) set.add(id)
    return set
  }, [masteredKeys, heard])

  const pickNext = useCallback(
    (excludeId?: string) => {
      const unseen = letters.filter((l) => l.id !== excludeId && !mastered.has(l.id))
      const pool = unseen.length > 0 ? unseen : letters.filter((l) => l.id !== excludeId)
      if (pool.length === 0) return letters[0] ?? null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [letters, mastered]
  )

  const ask = useCallback(
    (letter: LetterSound) => {
      stopVowelWordsAudio()
      const others = shuffle(letters.filter((l) => l.id !== letter.id)).slice(0, 2)
      setTarget(letter)
      setChoices(shuffle([letter, ...others]))
      setWrongId(null)
      setWin(false)
      setChecking(false)
      writeWhichSoundSession({ letterId: letter.id, letter: letter.letter })
      playVowelWordsSequence([
        { src: letter.audio.sound, fallbackText: letter.speak.sound },
        { src: letter.audio.keyword, fallbackText: letter.speak.keyword },
      ])
    },
    [letters]
  )

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
    setWin(true)
    playVowelWordsAudio(successAudio, { fallbackText: `Great! ${target.letter}` })
    void api
      .post('/api/learning/which-sound/celebrate', { letterId: target.id })
      .catch(() => undefined)
    setHeard((prev) => (prev.includes(target.id) ? prev : [...prev, target.id]))
    const next = pickNext(target.id)
    window.setTimeout(() => {
      if (next) ask(next)
    }, 1800)
  }

  if (!target) {
    return (
      <p className={`${whichSoundTheme.card} py-12 text-center font-semibold text-[#d6d3d1]`}>
        No letters yet.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className={`${whichSoundTheme.card} space-y-3 p-6 text-center sm:p-8`}>
        <p className="text-sm font-bold uppercase tracking-widest text-violet-300">Odd one in</p>
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">Which picture starts with that sound?</h2>
        <button
          type="button"
          onClick={() =>
            playVowelWordsSequence([
              { src: target.audio.sound, fallbackText: target.speak.sound },
              { src: target.audio.keyword, fallbackText: target.speak.keyword },
            ])
          }
          className={`${whichSoundTheme.btnPrimary} px-6 py-3`}
        >
          Hear the sound
        </button>
      </section>

      {win ? (
        <p className="text-center text-sm font-bold text-violet-300" aria-live="polite">
          +2 points! Next sound…
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3" aria-label="Picture choices">
          {choices.map((letter) => {
            const isWrong = wrongId === letter.id
            return (
              <button
                key={letter.id}
                type="button"
                disabled={checking}
                onClick={() => choose(letter)}
                className={`${whichSoundTheme.card} p-2 transition active:scale-95 sm:p-3 ${
                  isWrong ? 'ring-4 ring-rose-300' : 'hover:ring-2 hover:ring-violet-300'
                }`}
              >
                <WordPicture
                  src={letter.image}
                  word={letter.keyword}
                  alt="Picture choice"
                  className="aspect-square w-full rounded-2xl"
                  sizes="(max-width: 640px) 30vw, 200px"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
