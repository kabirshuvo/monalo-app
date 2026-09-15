'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ECO_PENGUIN_ITEMS_PER_PAGE, ECO_PENGUIN_BASE_PATH } from '@/lib/ecopenguin/constants'
import { paginateItems, totalPages } from '@/lib/ecopenguin/game'
import { itemNameToSlug } from '@/lib/ecopenguin/slug'
import {
  clearRoundDeck,
  readRoundDeck,
  writeEcoPenguinSession,
} from '@/lib/ecopenguin/session'
import { ecoTheme } from '@/features/ecopenguin/eco-theme'
import { stopEcoPenguinAudio } from '@/features/ecopenguin/hooks/useEcoPenguinAudio'
import ThisIsSection from '@/features/ecopenguin/components/ThisIsSection'
import WhichIsSection from '@/features/ecopenguin/components/WhichIsSection'
import type { EcoPenguinCategory, EcoPenguinItem } from '@/lib/ecopenguin/types'

type PlayMode = 'learn' | 'play' | 'round'

type CategoryPlayProps = {
  category: EcoPenguinCategory
  items: EcoPenguinItem[]
  masteredKeys?: string[]
  initialPage?: number
  initialMode?: 'learn' | 'play'
}

export default function CategoryPlay({
  category,
  items,
  masteredKeys = [],
  initialPage = 1,
  initialMode = 'learn',
}: CategoryPlayProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pages = totalPages(items.length, ECO_PENGUIN_ITEMS_PER_PAGE)

  const pageFromUrl = Number(searchParams.get('page') || initialPage) || 1
  const modeFromUrl = searchParams.get('mode')
  const startMode: PlayMode =
    modeFromUrl === 'play' || initialMode === 'play' ? 'play' : 'learn'

  const [page, setPage] = useState(() => Math.min(Math.max(1, pageFromUrl), pages))
  const [mode, setMode] = useState<PlayMode>(() =>
    startMode === 'play' ? 'play' : 'learn'
  )
  const [forceNewDeck, setForceNewDeck] = useState(false)

  useEffect(() => {
    const nextPage = Math.min(Math.max(1, pageFromUrl), pages)
    setPage(nextPage)
    if (modeFromUrl === 'play' || initialMode === 'play') {
      setMode('play')
    } else if (modeFromUrl === 'learn') {
      setMode('learn')
    }
  }, [pageFromUrl, modeFromUrl, pages, initialMode])

  const pageItems = useMemo(
    () => paginateItems(items, page, ECO_PENGUIN_ITEMS_PER_PAGE),
    [items, page]
  )

  const masteredNameSet = useMemo(() => {
    const set = new Set<string>()
    for (const key of masteredKeys) {
      const [cat, ...rest] = key.split(':')
      if (cat !== category.slug) continue
      const slug = rest.join(':')
      const match = items.find((item) => itemNameToSlug(item.name) === slug)
      if (match) set.add(match.name)
    }
    return set
  }, [masteredKeys, category.slug, items])

  const pageMasteredCount = pageItems.filter((item) => masteredNameSet.has(item.name)).length
  const pageComplete = pageItems.length > 0 && pageMasteredCount >= pageItems.length

  const preferUnmasteredNames = useMemo(
    () => pageItems.filter((item) => !masteredNameSet.has(item.name)).map((item) => item.name),
    [pageItems, masteredNameSet]
  )

  const totalMastered = items.filter((item) => masteredNameSet.has(item.name)).length

  useEffect(() => {
    stopEcoPenguinAudio()
  }, [page, mode])

  useEffect(() => {
    writeEcoPenguinSession({
      categorySlug: category.slug,
      categoryName: category.name,
      page,
      mode: mode === 'round' ? 'play' : mode,
    })
  }, [category.slug, category.name, page, mode])

  useEffect(() => {
    if (mode === 'play' && pageComplete) {
      setMode('round')
    }
  }, [mode, pageComplete])

  // Empty local deck (finished round) even if SSR mastery is one step behind
  useEffect(() => {
    if (mode !== 'play') return
    const deck = readRoundDeck(category.slug, page)
    if (deck !== null && deck.length === 0) {
      setMode('round')
    }
  }, [mode, category.slug, page])

  const syncUrl = (nextPage: number, nextMode: Exclude<PlayMode, 'round'> | 'play') => {
    const params = new URLSearchParams()
    params.set('page', String(nextPage))
    params.set('mode', nextMode === 'play' ? 'play' : 'learn')
    router.replace(
      `${ECO_PENGUIN_BASE_PATH}/categories/${category.slug}?${params.toString()}`,
      { scroll: false }
    )
  }

  const goToPage = (next: number) => {
    stopEcoPenguinAudio()
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
    // Fresh shuffle for a new play session on this page
    clearRoundDeck(category.slug, page)
    setForceNewDeck(true)
    setMode('play')
    syncUrl(page, 'play')
  }

  const backToLearn = () => {
    setMode('learn')
    setForceNewDeck(false)
    syncUrl(page, 'learn')
  }

  const handleDeckEmpty = () => {
    setMode('round')
  }

  const practiceAgain = () => {
    clearRoundDeck(category.slug, page)
    setForceNewDeck(false)
    setMode('learn')
    syncUrl(page, 'learn')
  }

  return (
    <div className="space-y-5">
      <div
        className={`${ecoTheme.cardSoft} flex flex-wrap items-center justify-between gap-3 px-4 py-3`}
      >
        <div className="space-y-1">
          <p className="text-sm font-semibold text-sky-900">
            <span className="mr-1" aria-hidden>
              📚
            </span>
            {items.length} words · {totalMastered} starred
          </p>
          <p className="text-xs font-medium text-sky-700/80">
            This round: {pageMasteredCount} / {pageItems.length} got it
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
                  i + 1 === page ? 'scale-110 bg-teal-500' : 'bg-sky-200 hover:bg-sky-300'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className={`${ecoTheme.btnSecondary} min-h-11 min-w-11 px-3 py-2`}
            aria-label="Previous page"
          >
            ←
          </button>
          <span className="min-w-[4.5rem] text-center text-xs font-bold text-sky-800">
            {page} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => goToPage(page + 1)}
            className={`${ecoTheme.btnPrimary} min-h-11 min-w-11 px-3 py-2`}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>

      {mode === 'learn' && (
        <>
          <ThisIsSection items={items} page={page} />
          <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-emerald-200 bg-emerald-50/80 px-4 py-5 text-center">
            <p className="text-sm font-semibold text-emerald-900 sm:text-base">
              Ready for a listening game with these pictures?
            </p>
            <button type="button" onClick={startPlay} className={`${ecoTheme.btnPrimary} px-6 py-3`}>
              I&apos;m ready to play →
            </button>
          </div>
        </>
      )}

      {mode === 'play' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={backToLearn} className={ecoTheme.btnSecondary}>
              ← Back to learn
            </button>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
              Listening game
            </p>
          </div>
          <WhichIsSection
            category={category}
            items={items}
            page={page}
            preferUnmasteredNames={preferUnmasteredNames}
            enabled
            forceNewDeck={forceNewDeck}
            onDeckEmpty={handleDeckEmpty}
          />
        </>
      )}

      {mode === 'round' && (
        <div className={`${ecoTheme.card} space-y-4 p-6 text-center sm:p-8`}>
          <p className="text-4xl" aria-hidden>
            ⭐🐧🎉
          </p>
          <h2 className="text-2xl font-extrabold text-sky-950 sm:text-3xl">Round complete!</h2>
          <p className="text-sm text-sky-800/85 sm:text-base">
            You got all {pageItems.length} words on this page. Nice listening!
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {page < pages ? (
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                className={`${ecoTheme.btnPrimary} px-6 py-3`}
              >
                Next round →
              </button>
            ) : (
              <Link href={ECO_PENGUIN_BASE_PATH} className={`${ecoTheme.btnPrimary} px-6 py-3`}>
                Pick another topic
              </Link>
            )}
            <button type="button" onClick={practiceAgain} className={ecoTheme.btnSecondary}>
              Practice again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
