'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { DIGRAPHS_BASE_PATH, DIGRAPHS_PER_PAGE } from '@/lib/digraphs/constants'
import { paginateItems, totalPages } from '@/lib/digraphs/game'
import {
  clearRoundDeck,
  readRoundDeck,
  writeDigraphsSession,
} from '@/lib/digraphs/session'
import { digraphTheme } from '@/features/digraphs/digraph-theme'
import { stopDigraphsAudio } from '@/features/digraphs/hooks/useDigraphsAudio'
import LearnSection from '@/features/digraphs/components/LearnSection'
import WhichWordSection from '@/features/digraphs/components/WhichWordSection'
import type { DigraphMeta, DigraphWord } from '@/lib/digraphs/types'

type PlayMode = 'learn' | 'play' | 'round'

type Props = {
  digraph: DigraphMeta
  words: DigraphWord[]
  masteredKeys?: string[]
  initialPage?: number
  initialMode?: 'learn' | 'play'
}

export default function DigraphPlay({
  digraph,
  words,
  masteredKeys = [],
  initialPage = 1,
  initialMode = 'learn',
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pages = totalPages(words.length, DIGRAPHS_PER_PAGE)

  const pageFromUrl = Number(searchParams.get('page') || initialPage) || 1
  const modeFromUrl = searchParams.get('mode')
  const startMode: PlayMode =
    modeFromUrl === 'play' || initialMode === 'play' ? 'play' : 'learn'

  const [page, setPage] = useState(() => Math.min(Math.max(1, pageFromUrl), pages))
  const [mode, setMode] = useState<PlayMode>(() => (startMode === 'play' ? 'play' : 'learn'))
  const [forceNewDeck, setForceNewDeck] = useState(false)

  useEffect(() => {
    const nextPage = Math.min(Math.max(1, pageFromUrl), pages)
    setPage(nextPage)
    if (modeFromUrl === 'play' || initialMode === 'play') setMode('play')
    else if (modeFromUrl === 'learn') setMode('learn')
  }, [pageFromUrl, modeFromUrl, pages, initialMode])

  const pageWords = useMemo(
    () => paginateItems(words, page, DIGRAPHS_PER_PAGE),
    [words, page]
  )

  const masteredSet = useMemo(() => {
    const set = new Set<string>()
    for (const key of masteredKeys) {
      const [did, ...rest] = key.split(':')
      if (did !== digraph.id) continue
      set.add(rest.join(':'))
    }
    return set
  }, [masteredKeys, digraph.id])

  const pageMasteredCount = pageWords.filter((w) => masteredSet.has(w.slug)).length
  const pageComplete = pageWords.length > 0 && pageMasteredCount >= pageWords.length
  const preferUnmasteredWords = useMemo(
    () => pageWords.filter((w) => !masteredSet.has(w.slug)).map((w) => w.word),
    [pageWords, masteredSet]
  )
  const totalMastered = words.filter((w) => masteredSet.has(w.slug)).length

  useEffect(() => {
    stopDigraphsAudio()
  }, [page, mode])

  useEffect(() => {
    writeDigraphsSession({
      digraphId: digraph.id,
      digraphLabel: digraph.label,
      page,
      mode: mode === 'round' ? 'play' : mode,
    })
  }, [digraph.id, digraph.label, page, mode])

  useEffect(() => {
    if (mode === 'play' && pageComplete) setMode('round')
  }, [mode, pageComplete])

  useEffect(() => {
    if (mode !== 'play') return
    const deck = readRoundDeck(digraph.id, page)
    if (deck !== null && deck.length === 0) setMode('round')
  }, [mode, digraph.id, page])

  const syncUrl = (nextPage: number, nextMode: 'learn' | 'play') => {
    const params = new URLSearchParams()
    params.set('page', String(nextPage))
    params.set('mode', nextMode)
    router.replace(`${DIGRAPHS_BASE_PATH}/${digraph.id}?${params.toString()}`, {
      scroll: false,
    })
  }

  const goToPage = (next: number) => {
    stopDigraphsAudio()
    const safe = Math.min(Math.max(1, next), pages)
    setPage(safe)
    setMode('learn')
    setForceNewDeck(false)
    syncUrl(safe, 'learn')
  }

  const startPlay = () => {
    if (pageComplete) {
      setMode('round')
      syncUrl(page, 'play')
      return
    }
    clearRoundDeck(digraph.id, page)
    setForceNewDeck(true)
    setMode('play')
    syncUrl(page, 'play')
  }

  const backToLearn = () => {
    setMode('learn')
    setForceNewDeck(false)
    syncUrl(page, 'learn')
  }

  const practiceAgain = () => {
    clearRoundDeck(digraph.id, page)
    setForceNewDeck(false)
    setMode('learn')
    syncUrl(page, 'learn')
  }

  return (
    <div className="space-y-5">
      <div
        className={`${digraphTheme.cardSoft} flex flex-wrap items-center justify-between gap-3 px-4 py-3`}
      >
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-900">
            {words.length} words · {totalMastered} starred
          </p>
          <p className="text-xs font-medium text-amber-700/80">
            This round: {pageMasteredCount} / {pageWords.length} got it
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" role="tablist" aria-label="Word pages">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i + 1 === page}
                aria-label={`Page ${i + 1}`}
                onClick={() => goToPage(i + 1)}
                className={`h-3.5 w-3.5 rounded-full transition ${
                  i + 1 === page ? 'scale-110 bg-orange-500' : 'bg-amber-200 hover:bg-amber-300'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className={`${digraphTheme.btnSecondary} min-h-11 min-w-11 px-3 py-2`}
            aria-label="Previous page"
          >
            ←
          </button>
          <span className="min-w-[4.5rem] text-center text-xs font-bold text-amber-800">
            {page} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => goToPage(page + 1)}
            className={`${digraphTheme.btnPrimary} min-h-11 min-w-11 px-3 py-2`}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>

      {mode === 'learn' && (
        <>
          <LearnSection digraph={digraph} words={words} page={page} />
          <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-orange-200 bg-orange-50/80 px-4 py-5 text-center">
            <p className="text-sm font-semibold text-amber-900 sm:text-base">
              Ready to hear {digraph.phoneme} and find the words?
            </p>
            <button type="button" onClick={startPlay} className={`${digraphTheme.btnPrimary} px-6 py-3`}>
              I&apos;m ready to play →
            </button>
          </div>
        </>
      )}

      {mode === 'play' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={backToLearn} className={digraphTheme.btnSecondary}>
              ← Back to learn
            </button>
            <p className="text-xs font-bold uppercase tracking-wide text-orange-800">
              Listening game
            </p>
          </div>
          <WhichWordSection
            digraph={digraph}
            words={words}
            page={page}
            preferUnmasteredWords={preferUnmasteredWords}
            enabled
            forceNewDeck={forceNewDeck}
            onDeckEmpty={() => setMode('round')}
          />
        </>
      )}

      {mode === 'round' && (
        <div className={`${digraphTheme.card} space-y-4 p-6 text-center sm:p-8`}>
          <p className="text-4xl" aria-hidden>
            ⭐🔤🎉
          </p>
          <h2 className="text-2xl font-extrabold text-amber-950 sm:text-3xl">Round complete!</h2>
          <p className="text-sm text-amber-800/85 sm:text-base">
            You got all {pageWords.length} {digraph.label} words on this page.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {page < pages ? (
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                className={`${digraphTheme.btnPrimary} px-6 py-3`}
              >
                Next round →
              </button>
            ) : (
              <Link href={DIGRAPHS_BASE_PATH} className={`${digraphTheme.btnPrimary} px-6 py-3`}>
                Pick another digraph
              </Link>
            )}
            <button type="button" onClick={practiceAgain} className={digraphTheme.btnSecondary}>
              Practice again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
