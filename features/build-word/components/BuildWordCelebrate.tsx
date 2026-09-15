'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import { VowelHighlight } from '@/features/vowel-words/components/VowelHighlight'
import { buildWordTheme } from '@/features/build-word/build-word-theme'
import { BUILD_WORD_BASE_PATH, writeBuildWordSession } from '@/lib/build-word/session'
import {
  playVowelWordsAudio,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import api from '@/lib/api'
import type { VowelMeta, VowelWord } from '@/lib/vowel-words/types'

type Props = {
  vowel: VowelMeta
  word: VowelWord
  showConfetti?: boolean
}

export default function BuildWordCelebrate({ vowel, word, showConfetti }: Props) {
  const [points, setPoints] = useState<number | null>(null)
  const [already, setAlready] = useState(false)

  useEffect(() => {
    writeBuildWordSession({
      vowelId: vowel.id,
      vowelLabel: vowel.label,
      wordSlug: word.slug,
    })
  }, [vowel.id, vowel.label, word.slug])

  useEffect(() => {
    if (!showConfetti) return
    stopVowelWordsAudio()
    playVowelWordsAudio(word.audio.success, { fallbackText: `Great! ${word.speakWord}` })
    return () => stopVowelWordsAudio()
  }, [showConfetti, word.audio.success, word.speakWord])

  useEffect(() => {
    if (!showConfetti) return
    let cancelled = false
    void (async () => {
      try {
        const res = await api.post<{ awarded?: boolean; points?: number }>(
          '/api/learning/build-the-word/celebrate',
          { vowelId: vowel.id, wordSlug: word.slug }
        )
        if (cancelled) return
        if (res.awarded) setPoints(res.points ?? 2)
        else setAlready(true)
      } catch {
        // ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [showConfetti, vowel.id, word.slug])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 py-6">
      {showConfetti && (
        <p className="text-4xl" aria-hidden>
          🎉🔤⭐
        </p>
      )}
      {points !== null && (
        <p className="rounded-full bg-amber-100 px-5 py-2 text-sm font-extrabold text-amber-950">
          +{points} points!
        </p>
      )}
      {already && (
        <p className="rounded-full bg-sky-100 px-5 py-2 text-sm font-extrabold text-sky-900">
          You&apos;ve spelled this one!
        </p>
      )}
      <div className={`${buildWordTheme.card} w-full max-w-md space-y-4 p-6 text-center`}>
        <WordPicture
          src={word.image}
          word={word.word}
          className="mx-auto aspect-square w-48 rounded-3xl"
          sizes="200px"
          priority
        />
        <h2 className="text-4xl font-extrabold text-sky-950">
          <VowelHighlight graphemes={word.graphemes} vowelLetter={vowel.letter} />
        </h2>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={`${BUILD_WORD_BASE_PATH}/${vowel.id}`} className={buildWordTheme.btnPrimary}>
          Spell another →
        </Link>
        <Link href={BUILD_WORD_BASE_PATH} className={buildWordTheme.btnSecondary}>
          All vowels
        </Link>
      </div>
    </div>
  )
}
