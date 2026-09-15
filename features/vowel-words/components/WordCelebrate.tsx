'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { VOWEL_WORDS_BASE_PATH } from '@/lib/vowel-words/constants'
import {
  markRoundDeckFinished,
  removeNameFromRoundDeck,
  writeLastCorrect,
  writeVowelWordsSession,
} from '@/lib/vowel-words/session'
import { vowelTheme } from '@/features/vowel-words/vowel-theme'
import { VowelHighlight } from '@/features/vowel-words/components/VowelHighlight'
import WordPicture from '@/features/vowel-words/components/WordPicture'
import {
  playVowelWordsAudio,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/useVowelWordsAudio'
import api from '@/lib/api'
import type { VowelMeta, VowelWord } from '@/lib/vowel-words/types'

type Props = {
  vowel: VowelMeta
  word: VowelWord
  showConfetti?: boolean
  resumePage?: number
}

export default function WordCelebrate({
  vowel,
  word,
  showConfetti,
  resumePage = 1,
}: Props) {
  const [burst, setBurst] = useState(showConfetti ?? true)
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null)
  const [alreadyMastered, setAlreadyMastered] = useState(false)

  useEffect(() => {
    writeVowelWordsSession({
      vowelId: vowel.id,
      vowelLabel: vowel.label,
      page: resumePage,
      mode: 'play',
    })
    if (showConfetti) {
      const remaining = removeNameFromRoundDeck(vowel.id, resumePage, word.word)
      writeLastCorrect({ vowelId: vowel.id, page: resumePage, word: word.word })
      if (remaining.length === 0) markRoundDeckFinished(vowel.id, resumePage)
    }
  }, [vowel.id, vowel.label, resumePage, word.word, showConfetti])

  useEffect(() => {
    if (!showConfetti) return
    const t = window.setTimeout(() => setBurst(false), 5000)
    return () => window.clearTimeout(t)
  }, [showConfetti])

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
          '/api/learning/vowel-words/celebrate',
          { vowelId: vowel.id, wordSlug: word.slug }
        )
        if (cancelled) return
        if (res.awarded) {
          setPointsAwarded(res.points ?? 2)
          setAlreadyMastered(false)
        } else {
          setAlreadyMastered(true)
        }
      } catch {
        // non-blocking
      }
    })()
    return () => {
      cancelled = true
    }
  }, [showConfetti, vowel.id, word.slug])

  const keepHref = `${VOWEL_WORDS_BASE_PATH}/${vowel.id}?page=${resumePage}&mode=play`

  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-6 py-4">
      {burst && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-4xl sm:text-5xl" aria-hidden>
          <span>🎉</span>
          <span>⭐</span>
          <span>🔤</span>
        </div>
      )}
      {pointsAwarded !== null && (
        <p className="rounded-full bg-gradient-to-r from-amber-200 to-yellow-200 px-5 py-2 text-sm font-extrabold text-amber-950 shadow-sm">
          +{pointsAwarded} points!
        </p>
      )}
      {alreadyMastered && (
        <p className="rounded-full bg-violet-100 px-5 py-2 text-sm font-extrabold text-violet-900 shadow-sm">
          You&apos;ve got this one!
        </p>
      )}
      <div className={`${vowelTheme.card} w-full max-w-md p-6 text-center sm:p-8`}>
        <WordPicture
          src={word.image}
          word={word.word}
          className="mx-auto aspect-square w-full max-w-xs rounded-3xl shadow-md"
          sizes="320px"
          priority
        />
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-fuchsia-700">
          Great job!
        </p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-wide text-violet-950 sm:text-5xl">
          <VowelHighlight graphemes={word.graphemes} vowelLetter={vowel.letter} />
        </h2>
        <p className="mt-2 text-sm text-violet-800/80">
          Short {vowel.letter} · {vowel.phoneme}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={keepHref} className={vowelTheme.btnPrimary}>
          Keep playing →
        </Link>
        <Link href={VOWEL_WORDS_BASE_PATH} className={vowelTheme.btnSecondary}>
          All vowels
        </Link>
      </div>
    </div>
  )
}
