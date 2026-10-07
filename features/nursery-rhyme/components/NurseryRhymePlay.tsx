'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import { nurseryRhymeTheme } from '@/features/nursery-rhyme/nursery-rhyme-theme'
import {
  playVowelWordsAudio,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import { writeNurseryRhymeSession } from '@/lib/nursery-rhyme/session'
import type { NurseryRhymeSet } from '@/lib/nursery-rhyme/constants'
import { ECO_PENGUIN_MASTERY_HITS } from '@/lib/learning/cambridge-esl'
import { recordMasteryHit } from '@/lib/learning/spaced-mastery'
import { bumpGuestWin } from '@/lib/learning/guest-try'
import GuestConvertNudge from '@/features/learning/components/GuestConvertNudge'

type Props = {
  sets: NurseryRhymeSet[]
  masteredKeys?: string[]
  guest?: boolean
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export default function NurseryRhymePlay({ sets, masteredKeys = [], guest = false }: Props) {
  const [heard, setHeard] = useState<string[]>([])
  const [guestWins, setGuestWins] = useState(0)
  const [target, setTarget] = useState<NurseryRhymeSet | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [wrong, setWrong] = useState(false)
  const [win, setWin] = useState(false)
  const [checking, setChecking] = useState(false)
  const [hitHint, setHitHint] = useState<string | null>(null)

  const mastered = useMemo(() => {
    const set = new Set(masteredKeys)
    for (const id of heard) set.add(id)
    return set
  }, [masteredKeys, heard])

  const pickNext = useCallback(
    (excludeId?: string) => {
      const unseen = sets.filter((s) => s.id !== excludeId && !mastered.has(s.id))
      const pool = unseen.length > 0 ? unseen : sets.filter((s) => s.id !== excludeId)
      if (pool.length === 0) return sets[0] ?? null
      return pool[Math.floor(Math.random() * pool.length)]
    },
    [sets, mastered]
  )

  const ask = useCallback((set: NurseryRhymeSet) => {
    stopVowelWordsAudio()
    setTarget({ ...set, choices: shuffle(set.choices) })
    setPicked([])
    setWrong(false)
    setWin(false)
    setChecking(false)
    setHitHint(null)
    writeNurseryRhymeSession({ setId: set.id })
    playVowelWordsAudio(set.audio ?? '', { fallbackText: set.speak })
  }, [])

  useEffect(() => {
    const first = pickNext()
    if (first) ask(first)
    return () => stopVowelWordsAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!target) {
    return (
      <p className={`${nurseryRhymeTheme.card} py-12 text-center font-semibold text-[#d6d3d1]`}>
        No rhymes yet.
      </p>
    )
  }

  const match = new Set(target.matchIds)

  const hear = () => {
    playVowelWordsAudio(target.audio ?? '', { fallbackText: target.speak })
  }

  const tap = (id: string) => {
    if (checking || win || picked.includes(id)) return
    const next = [...picked, id]
    setPicked(next)
    if (next.length < 2) return
    setChecking(true)
    const ok = next.every((x) => match.has(x)) && next.length === 2
    if (!ok) {
      setWrong(true)
      playVowelWordsAudio('', { fallbackText: 'Try again' })
      window.setTimeout(() => {
        setPicked([])
        setWrong(false)
        setChecking(false)
      }, 700)
      return
    }
    setWin(true)
    const result = recordMasteryHit('nursery-rhyme', target.id)
    if (result.justMastered) {
      playVowelWordsAudio('', { fallbackText: 'Great! They rhyme.' })
      void api.post('/api/learning/nursery-rhyme/celebrate', { setId: target.id }).catch(() => undefined)
      setHeard((prev) => (prev.includes(target.id) ? prev : [...prev, target.id]))
      if (guest) setGuestWins(bumpGuestWin())
      setHitHint(guest ? 'Great! Next rhyme…' : '+2 points! Next rhyme…')
    } else if (result.alreadyMastered) {
      playVowelWordsAudio('', { fallbackText: 'Great! They rhyme.' })
      setHitHint('Already mastered — keep practising!')
    } else {
      playVowelWordsAudio('', { fallbackText: 'Good! One more time.' })
      setHitHint(`Nice! ${result.hits}/${ECO_PENGUIN_MASTERY_HITS} to master`)
    }
    const following = pickNext(target.id)
    window.setTimeout(() => {
      if (following) ask(following)
    }, 1800)
  }

  return (
    <div className="space-y-6">
      {guest ? <GuestConvertNudge refreshKey={guestWins} /> : null}
      <section className={`${nurseryRhymeTheme.card} space-y-3 p-6 text-center sm:p-8`}>
        <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">Rhyme time</p>
        <h2 className="text-2xl font-extrabold text-[#fafaf9]">{target.prompt}</h2>
        <button type="button" onClick={hear} className={`${nurseryRhymeTheme.btnPrimary} px-6 py-3`}>
          Hear the words
        </button>
      </section>
      {win ? (
        <p className="text-center text-sm font-bold text-cyan-300" aria-live="polite">
          {hitHint ?? 'Next rhyme…'}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3" aria-label="Picture choices">
          {target.choices.map((choice) => {
            const selected = picked.includes(choice.id)
            return (
              <button
                key={choice.id}
                type="button"
                disabled={checking}
                onClick={() => tap(choice.id)}
                className={`${nurseryRhymeTheme.card} p-2 transition active:scale-95 sm:p-3 ${
                  wrong && selected
                    ? 'ring-4 ring-rose-300'
                    : selected
                      ? 'ring-4 ring-cyan-300'
                      : 'hover:ring-2 hover:ring-cyan-300'
                }`}
              >
                <WordPicture
                  src={choice.image}
                  word={choice.label}
                  alt={choice.label}
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
