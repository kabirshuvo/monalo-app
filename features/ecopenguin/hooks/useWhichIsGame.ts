'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ECO_PENGUIN_ITEMS_PER_PAGE } from '@/lib/ecopenguin/constants'
import {
  buildRoundDeck,
  paginateItems,
  shuffleItems,
  totalPages,
} from '@/lib/ecopenguin/game'
import {
  buildWhichQuestionAudioUrl,
  buildWhichOneIntroUrl,
} from '@/lib/ecopenguin/audio'
import {
  playEcoPenguinAudio,
  playEcoPenguinSequence,
  stopEcoPenguinAudio,
} from '@/features/ecopenguin/hooks/useEcoPenguinAudio'
import { useEcoPenguinUi } from '@/features/ecopenguin/context/EcoPenguinUiContext'
import { itemNameToSlug } from '@/lib/ecopenguin/slug'
import {
  clearLastCorrect,
  markRoundDeckFinished,
  readLastCorrect,
  readRoundDeck,
  removeNameFromRoundDeck,
  writeLastCorrect,
  writeRoundDeck,
} from '@/lib/ecopenguin/session'
import type { EcoPenguinItem } from '@/lib/ecopenguin/types'

type UseWhichIsGameOptions = {
  items: EcoPenguinItem[]
  categorySlug: string
  page: number
  /** Prefer asking about these names when present on the page */
  preferUnmasteredNames?: string[]
  enabled?: boolean
  /** When true, wipe stored deck and build a fresh shuffle (new Play session). */
  forceNewDeck?: boolean
  onCorrect: (item: EcoPenguinItem) => void
  onDeckEmpty?: () => void
}

function resolvePool(
  pageItems: EcoPenguinItem[],
  preferUnmasteredNames?: string[]
): string[] {
  const preferred = preferUnmasteredNames?.length
    ? pageItems
        .filter((item) => preferUnmasteredNames.includes(item.name))
        .map((i) => i.name)
    : []
  if (preferred.length > 0) return preferred
  return pageItems.map((i) => i.name)
}

/**
 * Load or build a no-repeat deck for this page.
 * `null` storage = never started → build.
 * `[]` storage = round finished → stay empty (do not rebuild from stale mastery).
 */
function ensureRoundDeck(
  categorySlug: string,
  page: number,
  pool: string[],
  forceNew: boolean
): string[] {
  const last = readLastCorrect()
  if (last && last.categorySlug === categorySlug && last.page === page) {
    removeNameFromRoundDeck(categorySlug, page, last.name)
    clearLastCorrect()
  }

  if (forceNew) {
    const deck = buildRoundDeck(pool)
    writeRoundDeck(categorySlug, page, deck)
    return deck
  }

  const stored = readRoundDeck(categorySlug, page)

  // Explicit finished round — do not rebuild
  if (stored !== null && stored.length === 0) {
    return []
  }

  if (stored === null) {
    const deck = buildRoundDeck(pool)
    writeRoundDeck(categorySlug, page, deck)
    return deck
  }

  // Prune names no longer in pool; keep order for remaining
  const pruned = stored.filter((n) => pool.includes(n))
  if (pruned.length !== stored.length) {
    writeRoundDeck(categorySlug, page, pruned)
  }
  return pruned
}

export function useWhichIsGame({
  items,
  categorySlug,
  page,
  preferUnmasteredNames,
  enabled = true,
  forceNewDeck = false,
  onCorrect,
  onDeckEmpty,
}: UseWhichIsGameOptions) {
  const { audioUnlocked, muted } = useEcoPenguinUi()
  const [targetName, setTargetName] = useState('')
  const [shakeItemId, setShakeItemId] = useState<number | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [wrongIds, setWrongIds] = useState<number[]>([])
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const [needsTapToListen, setNeedsTapToListen] = useState(false)
  const [deckEmpty, setDeckEmpty] = useState(false)

  const onDeckEmptyRef = useRef(onDeckEmpty)
  onDeckEmptyRef.current = onDeckEmpty
  const forceNewConsumed = useRef(false)

  const pageItems = useMemo(
    () => shuffleItems(paginateItems(items, page, ECO_PENGUIN_ITEMS_PER_PAGE)),
    [items, page]
  )

  const pages = totalPages(items.length, ECO_PENGUIN_ITEMS_PER_PAGE)

  useEffect(() => {
    stopEcoPenguinAudio()
    setIsLocked(false)
    setShakeItemId(null)
    setWrongIds([])
    setCoachMessage(null)
    setNeedsTapToListen(false)

    if (!enabled || pageItems.length === 0) {
      setTargetName('')
      setDeckEmpty(false)
      return
    }

    const pool = resolvePool(pageItems, preferUnmasteredNames)
    const useForce = forceNewDeck && !forceNewConsumed.current
    if (useForce) forceNewConsumed.current = true

    const deck = ensureRoundDeck(categorySlug, page, pool, useForce)

    if (deck.length === 0) {
      setTargetName('')
      setDeckEmpty(true)
      onDeckEmptyRef.current?.()
      return
    }

    setDeckEmpty(false)
    setTargetName(deck[0])
    // Do not re-roll when preferUnmasteredNames identity/contents update mid-question
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, categorySlug, page, pageItems, forceNewDeck])

  // Reset force flag when leaving play so next "I'm ready" can rebuild
  useEffect(() => {
    if (!enabled) forceNewConsumed.current = false
  }, [enabled])

  const playQuestionSequence = useCallback(() => {
    if (!targetName || isLocked || muted) return
    setNeedsTapToListen(false)
    playEcoPenguinSequence(
      [buildWhichOneIntroUrl(), buildWhichQuestionAudioUrl(categorySlug, targetName)],
      {
        onBlocked: () => setNeedsTapToListen(true),
      }
    )
  }, [targetName, categorySlug, isLocked, muted])

  useEffect(() => {
    if (!enabled || !targetName || isLocked) return
    if (!audioUnlocked) {
      setNeedsTapToListen(true)
      return
    }
    if (muted) {
      setNeedsTapToListen(false)
      return
    }
    playQuestionSequence()
    return () => stopEcoPenguinAudio()
  }, [
    enabled,
    targetName,
    categorySlug,
    isLocked,
    audioUnlocked,
    muted,
    playQuestionSequence,
  ])

  const replayQuestion = useCallback(() => {
    if (!targetName || isLocked) return
    setNeedsTapToListen(false)
    setCoachMessage(null)
    playEcoPenguinAudio(buildWhichQuestionAudioUrl(categorySlug, targetName), undefined)
  }, [targetName, categorySlug, isLocked])

  const handleGuess = useCallback(
    (item: EcoPenguinItem) => {
      if (isLocked || !enabled) return

      if (item.name === targetName) {
        setIsLocked(true)
        setCoachMessage(null)
        stopEcoPenguinAudio()

        const remaining = removeNameFromRoundDeck(categorySlug, page, item.name)
        writeLastCorrect({ categorySlug, page, name: item.name })

        if (remaining.length === 0) {
          markRoundDeckFinished(categorySlug, page)
          setDeckEmpty(true)
        }

        onCorrect(item)
        return
      }

      stopEcoPenguinAudio()
      setShakeItemId(item.id)
      setWrongIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))
      setCoachMessage('Not that one — listen again')
      window.setTimeout(() => setShakeItemId(null), 500)
      playEcoPenguinAudio(item.audio.error, () => {
        if (!muted) {
          playEcoPenguinAudio(buildWhichQuestionAudioUrl(categorySlug, targetName))
        }
      })
    },
    [targetName, categorySlug, page, isLocked, onCorrect, enabled, muted]
  )

  return {
    targetName,
    pageItems,
    pages,
    shakeItemId,
    isLocked,
    wrongIds,
    coachMessage,
    needsTapToListen,
    deckEmpty,
    replayQuestion,
    playQuestionSequence,
    handleGuess,
    targetSlug: targetName ? itemNameToSlug(targetName) : '',
  }
}
