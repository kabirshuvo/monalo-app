'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ECO_PENGUIN_ITEMS_PER_PAGE } from '@/lib/ecopenguin/constants'
import {
  paginateItems,
  pickRandomItemName,
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
import { itemNameToSlug } from '@/lib/ecopenguin/slug'
import type { EcoPenguinItem } from '@/lib/ecopenguin/types'

type UseWhichIsGameOptions = {
  items: EcoPenguinItem[]
  categorySlug: string
  page: number
  onCorrect: (item: EcoPenguinItem) => void
}

export function useWhichIsGame({
  items,
  categorySlug,
  page,
  onCorrect,
}: UseWhichIsGameOptions) {
  const [targetName, setTargetName] = useState('')
  const [shakeItemId, setShakeItemId] = useState<number | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  const pageItems = useMemo(
    () => shuffleItems(paginateItems(items, page, ECO_PENGUIN_ITEMS_PER_PAGE)),
    [items, page]
  )

  const pages = totalPages(items.length, ECO_PENGUIN_ITEMS_PER_PAGE)

  useEffect(() => {
    stopEcoPenguinAudio()
    setIsLocked(false)
    setShakeItemId(null)
    if (pageItems.length > 0) {
      setTargetName(pickRandomItemName(pageItems))
    } else {
      setTargetName('')
    }
  }, [pageItems, categorySlug, page])

  useEffect(() => {
    if (!targetName || isLocked) return

    const stop = playEcoPenguinSequence([
      buildWhichOneIntroUrl(),
      buildWhichQuestionAudioUrl(categorySlug, targetName),
    ])

    return stop
  }, [targetName, categorySlug, isLocked])

  const replayQuestion = useCallback(() => {
    if (!targetName || isLocked) return
    playEcoPenguinAudio(buildWhichQuestionAudioUrl(categorySlug, targetName))
  }, [targetName, categorySlug, isLocked])

  const handleGuess = useCallback(
    (item: EcoPenguinItem) => {
      if (isLocked) return

      if (item.name === targetName) {
        setIsLocked(true)
        stopEcoPenguinAudio()
        onCorrect(item)
        return
      }

      stopEcoPenguinAudio()
      setShakeItemId(item.id)
      window.setTimeout(() => setShakeItemId(null), 500)
      playEcoPenguinAudio(item.audio.error)
    },
    [targetName, categorySlug, isLocked, onCorrect]
  )

  return {
    targetName,
    pageItems,
    pages,
    shakeItemId,
    isLocked,
    replayQuestion,
    handleGuess,
    targetSlug: targetName ? itemNameToSlug(targetName) : '',
  }
}
