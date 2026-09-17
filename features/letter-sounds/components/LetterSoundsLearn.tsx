'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import { letterSoundsTheme } from '@/features/letter-sounds/letter-sounds-theme'
import {
  playVowelWordsSequence,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import { LETTER_SOUND_GROUPS, LETTER_SOUNDS_QUIZ_PATH } from '@/lib/letter-sounds/constants'
import { LEARNING_HUB_PATH } from '@/lib/learning/kids-hub'
import { writeLetterSoundsSession } from '@/lib/letter-sounds/session'
import type { LetterSound } from '@/lib/letter-sounds/types'

type Props = {
  letters: LetterSound[]
}

function keywordParts(keyword: string, letter: string) {
  const index = keyword.toLowerCase().indexOf(letter.toLowerCase())
  if (index < 0) return { before: keyword, hit: '', after: '' }
  return {
    before: keyword.slice(0, index),
    hit: keyword.slice(index, index + letter.length),
    after: keyword.slice(index + letter.length),
  }
}

export default function LetterSoundsLearn({ letters }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [heard, setHeard] = useState<string[]>([])

  const groups = useMemo(
    () =>
      LETTER_SOUND_GROUPS.map((group) => ({
        ...group,
        letters: letters.filter((letter) => letter.group === group.id),
      })).filter((group) => group.letters.length > 0),
    [letters]
  )

  useEffect(() => () => stopVowelWordsAudio(), [])

  const handleTap = (letter: LetterSound) => {
    setPlayingId(letter.id)
    setHeard((prev) => (prev.includes(letter.id) ? prev : [...prev, letter.id]))
    writeLetterSoundsSession({ letterId: letter.id, keyword: letter.keyword, mode: 'learn' })
    playVowelWordsSequence([
      { src: letter.audio.keyword, fallbackText: letter.speak.keyword },
      { src: letter.audio.sound, fallbackText: letter.speak.sound },
    ])
    window.setTimeout(() => {
      setPlayingId((current) => (current === letter.id ? null : current))
    }, 5500)
  }

  return (
    <div className="space-y-8">
      <section className={`${letterSoundsTheme.card} p-6 text-center sm:p-8`}>
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">26 sounds</p>
        <h2 className="mt-2 text-2xl font-extrabold text-emerald-950 sm:text-3xl">Letter sounds</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-emerald-900/80 sm:text-base">
          Tap a letter and listen: S for sun, then the sound to copy. The word comes first, so you can hear the sound inside it.
        </p>
        <Link href={LETTER_SOUNDS_QUIZ_PATH} className={`${letterSoundsTheme.btnPrimary} mt-5 inline-flex px-6 py-3`}>
          Play the quiz →
        </Link>
      </section>

      {groups.map((group) => (
        <section key={group.id} className="space-y-3">
          <h3 className="text-center text-sm font-bold uppercase tracking-widest text-emerald-700">
            {group.label}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {group.letters.map((letter) => {
              const isPlaying = playingId === letter.id
              const wasHeard = heard.includes(letter.id)
              const parts = keywordParts(letter.keyword, letter.letter)
              return (
                <button
                  key={letter.id}
                  type="button"
                  onClick={() => handleTap(letter)}
                  className={`${letterSoundsTheme.card} p-4 text-center transition active:scale-95 ${
                    isPlaying ? 'ring-4 ring-emerald-300' : 'hover:shadow-md'
                  }`}
                >
                  <p className="text-5xl font-black text-emerald-950">{letter.letter}</p>
                  <WordPicture
                    src={letter.image}
                    word={letter.keyword}
                    className="mx-auto mt-3 aspect-square w-full rounded-2xl"
                    sizes="(max-width: 640px) 40vw, 180px"
                  />
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    {letter.letter} for {letter.keyword}
                  </p>
                  <p className="text-lg font-extrabold text-emerald-950">
                    {parts.before}
                    <span className="rounded-lg bg-gradient-to-b from-amber-300 to-orange-400 px-1.5 text-white">
                      {parts.hit}
                    </span>
                    {parts.after}
                  </p>
                  {isPlaying && (
                    <span className="mt-1 inline-block text-xs font-bold text-emerald-700">Listening…</span>
                  )}
                  {!isPlaying && wasHeard && (
                    <span className="mt-1 inline-block text-xs font-bold text-emerald-700">Heard</span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      <footer className={`${letterSoundsTheme.card} p-6 text-center sm:p-8`}>
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Next</p>
        <h2 className="mt-2 text-2xl font-extrabold text-emerald-950 sm:text-3xl">Hear it again</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-emerald-900/80 sm:text-base">
          You have all 26 sounds. Tap a letter again, or listen and pick the letter in the quiz.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link href={LETTER_SOUNDS_QUIZ_PATH} className={`${letterSoundsTheme.btnPrimary} px-6 py-3`}>
            Play the quiz →
          </Link>
          <Link href={LEARNING_HUB_PATH} className={letterSoundsTheme.btnSecondary}>
            Eco Penguin
          </Link>
        </div>
      </footer>
    </div>
  )
}
