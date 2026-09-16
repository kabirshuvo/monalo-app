'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DIGRAPHS_BASE_PATH } from '@/lib/digraphs/constants'
import {
  markRoundDeckFinished,
  removeNameFromRoundDeck,
  writeLastCorrect,
  writeDigraphsSession,
} from '@/lib/digraphs/session'
import { digraphTheme } from '@/features/digraphs/digraph-theme'
import { DigraphHighlight } from '@/features/digraphs/components/DigraphHighlight'
import DigraphPicture from '@/features/digraphs/components/DigraphPicture'
import {
  playDigraphsAudio,
  stopDigraphsAudio,
} from '@/features/digraphs/hooks/useDigraphsAudio'
import api from '@/lib/api'
import type { DigraphMeta, DigraphWord } from '@/lib/digraphs/types'

type Props = {
  digraph: DigraphMeta
  word: DigraphWord
  showConfetti?: boolean
  resumePage?: number
}

export default function WordCelebrate({
  digraph,
  word,
  showConfetti,
  resumePage = 1,
}: Props) {
  const router = useRouter()
  const [burst, setBurst] = useState(showConfetti ?? true)
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null)
  const [alreadyMastered, setAlreadyMastered] = useState(false)

  useEffect(() => {
    writeDigraphsSession({
      digraphId: digraph.id,
      digraphLabel: digraph.label,
      page: resumePage,
      mode: 'play',
    })
    if (showConfetti) {
      const remaining = removeNameFromRoundDeck(digraph.id, resumePage, word.word)
      writeLastCorrect({ digraphId: digraph.id, page: resumePage, word: word.word })
      if (remaining.length === 0) markRoundDeckFinished(digraph.id, resumePage)
    }
  }, [digraph.id, digraph.label, resumePage, word.word, showConfetti])

  useEffect(() => {
    if (!showConfetti) return
    const t = window.setTimeout(() => setBurst(false), 5000)
    return () => window.clearTimeout(t)
  }, [showConfetti])

  useEffect(() => {
    if (!showConfetti) return
    stopDigraphsAudio()
    playDigraphsAudio(word.audio.success, { fallbackText: `Great! ${word.speakWord}` })
    return () => stopDigraphsAudio()
  }, [showConfetti, word.audio.success, word.speakWord])

  useEffect(() => {
    if (!showConfetti) return
    let cancelled = false
    void (async () => {
      try {
        const res = await api.post<{ awarded?: boolean; points?: number }>(
          '/api/learning/digraphs/celebrate',
          { digraphId: digraph.id, wordSlug: word.slug }
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
  }, [showConfetti, digraph.id, word.slug])

  const examHref = `${DIGRAPHS_BASE_PATH}/${digraph.id}?page=${resumePage}&mode=play`

  useEffect(() => {
    if (!showConfetti) return
    const t = window.setTimeout(() => {
      router.replace(examHref)
    }, 1200)
    return () => window.clearTimeout(t)
  }, [showConfetti, examHref, router])

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
        <p className="rounded-full bg-orange-100 px-5 py-2 text-sm font-extrabold text-orange-900 shadow-sm">
          You&apos;ve got this one!
        </p>
      )}
      <div className={`${digraphTheme.card} w-full max-w-md p-6 text-center sm:p-8`}>
        <DigraphPicture
          src={word.image}
          word={word.word}
          className="mx-auto aspect-square w-full max-w-xs rounded-3xl shadow-md"
          sizes="320px"
          priority
        />
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-orange-700">
          Great job!
        </p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-wide text-amber-950 sm:text-5xl">
          <DigraphHighlight graphemes={word.graphemes} digraph={digraph.digraph} />
        </h2>
        <p className="mt-2 text-sm text-amber-800/80">
          {digraph.letter} · {digraph.phoneme}
        </p>
      </div>
      <p className="text-sm font-bold text-amber-800">Back to the listening game…</p>
    </div>
  )
}
