'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { VOWEL_WORDS_BASE_PATH, VOWEL_WORDS_PER_PAGE } from '@/lib/vowel-words/constants'
import { paginateItems, totalPages } from '@/lib/vowel-words/game'
import {
  clearRoundDeck,
  readRoundDeck,
  writeVowelWordsSession,
} from '@/lib/vowel-words/session'
import { vowelTheme } from '@/features/vowel-words/vowel-theme'
import { stopVowelWordsAudio } from '@/features/vowel-words/hooks/useVowelWordsAudio'
import LearnSection from '@/features/vowel-words/components/LearnSection'
import WhichWordSection from '@/features/vowel-words/components/WhichWordSection'
import type { VowelMeta, VowelWord } from '@/lib/vowel-words/types'

type PlayMode = 'learn' | 'play' | 'round'

type Props = {
  vowel: VowelMeta
  words: VowelWord[]
  masteredKeys?: string[]
  initialPage?: number
  initialMode?: 'learn' | 'play'
}

export default function VowelPlay({
  vowel,
  words,
  masteredKeys = [],
  initialPage = 1,
  initialMode = 'learn',
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pages = totalPages(words.length, VOWEL_WORDS_PER_PAGE)

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
    () => paginateItems(words, page, VOWEL_WORDS_PER_PAGE),
    [words, page]
  )

  const masteredSet = useMemo(() => {
    const set = new Set<string>()
    for (const key of masteredKeys) {
      const [vid, ...rest] = key.split(':')
      if (vid !== vowel.id) continue
      set.add(rest.join(':'))
    }
    return set
  }, [masteredKeys, vowel.id])

  const pageMasteredCount = pageWords.filter((w) => masteredSet.has(w.slug)).length
  const pageComplete = pageWords.length > 0 && pageMasteredCount >= pageWords.length
  const preferUnmasteredWords = useMemo(
    () => pageWords.filter((w) => !masteredSet.has(w.slug)).map((w) => w.word),
    [pageWords, masteredSet]
  )
  const totalMastered = words.filter((w) => masteredSet.has(w.slug)).length

  useEffect(() => {
    stopVowelWordsAudio()
  }, [page, mode])

  useEffect(() => {
    writeVowelWordsSession({
      vowelId: vowel.id,
      vowelLabel: vowel.label,
      page,
      mode: mode === 'round' ? 'play' : mode,
    })
  }, [vowel.id, vowel.label, page, mode])

  useEffect(() => {
    if (mode === 'play' && pageComplete) setMode('round')
  }, [mode, pageComplete])

  useEffect(() => {
    if (mode !== 'play') return
    const deck = readRoundDeck(vowel.id, page)
    if (deck !== null && deck.length === 0) setMode('round')
  }, [mode, vowel.id, page])

  const syncUrl = (nextPage: number, nextMode: 'learn' | 'play') => {
    const params = new URLSearchParams()
    params.set('page', String(nextPage))
    params.set('mode', nextMode)
    router.replace(`${VOWEL_WORDS_BASE_PATH}/${vowel.id}?${params.toString()}`, {
      scroll: false,
    })
  }

  const goToPage = (next: number) => {
    stopVowelWordsAudio()
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
    clearRoundDeck(vowel.id, page)
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
    clearRoundDeck(vowel.id, page)
    setForceNewDeck(false)
    setMode('learn')
    syncUrl(page, 'learn')
  }

  return (
    <div className="space-y-5">
      <div
        className={`${vowelTheme.cardSoft} flex flex-wrap items-center justify-between gap-3 px-4 py-3`}
      >
        <div className="space-y-1">
          <p className="text-sm font-semibold text-violet-900">
            {words.length} words · {totalMastered} starred
          </p>
          <p className="text-xs font-medium text-violet-700/80">
            This round: {pageMasteredCount} / {pageWords.length} got it
          </p>
        </div>
        {pages > 1 && (
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
                    i + 1 === page ? 'scale-110 bg-fuchsia-500' : 'bg-violet-200 hover:bg-violet-300'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className={`${vowelTheme.btnSecondary} min-h-11 min-w-11 px-3 py-2`}
              aria-label="Previous page"
            >
              ←
            </button>
            <span className="min-w-[4.5rem] text-center text-xs font-bold text-violet-800">
              {page} / {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => goToPage(page + 1)}
              className={`${vowelTheme.btnPrimary} min-h-11 min-w-11 px-3 py-2`}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        )}
      </div>

      {mode === 'learn' && (
        <>
          <LearnSection vowel={vowel} words={words} page={page} />
          <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-fuchsia-200 bg-fuchsia-50/80 px-4 py-5 text-center">
            <p className="text-sm font-semibold text-violet-900 sm:text-base">
              Ready to hear {vowel.phoneme} and find the words?
            </p>
            <button type="button" onClick={startPlay} className={`${vowelTheme.btnPrimary} px-6 py-3`}>
              I&apos;m ready to play →
            </button>
          </div>
        </>
      )}

      {mode === 'play' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={backToLearn} className={vowelTheme.btnSecondary}>
              ← Back to learn
            </button>
            <p className="text-xs font-bold uppercase tracking-wide text-fuchsia-800">
              Listening game
            </p>
          </div>
          <WhichWordSection
            vowel={vowel}
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
        <div className={`${vowelTheme.card} space-y-4 p-6 text-center sm:p-8`}>
          <p className="text-4xl" aria-hidden>
            ⭐🔤🎉
          </p>
          <h2 className="text-2xl font-extrabold text-violet-950 sm:text-3xl">Round complete!</h2>
          <p className="text-sm text-violet-800/85 sm:text-base">
            You got all {pageWords.length} {vowel.label} words.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {page < pages ? (
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                className={`${vowelTheme.btnPrimary} px-6 py-3`}
              >
                Next round →
              </button>
            ) : (
              <Link href={VOWEL_WORDS_BASE_PATH} className={`${vowelTheme.btnPrimary} px-6 py-3`}>
                Pick another vowel
              </Link>
            )}
            <button type="button" onClick={practiceAgain} className={vowelTheme.btnSecondary}>
              Practice again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
