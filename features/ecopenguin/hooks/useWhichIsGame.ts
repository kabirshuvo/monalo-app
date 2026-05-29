'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ECO_PENGUIN_ITEMS_PER_PAGE,
} from '@/lib/ecopenguin/constants'
import {
  paginateItems,
  pickRandomItemName,
  shuffleItems,
  totalPages,
} from '@/lib/ecopenguin/game'
import {
  buildCorrectAudioUrl,
  buildWhichQuestionAudioUrl,
  buildWhichOneIntroUrl,
} from '@/lib/ecopenguin/audio'
import { playEcoPenguinAudio, playEcoPenguinSequence } from '@/features/ecopenguin/hooks/useEcoPenguinAudio'
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

  const pageItems = useMemo(
    () => shuffleItems(paginateItems(items, page, ECO_PENGUIN_ITEMS_PER_PAGE)),
    [items, page]
  )

  const pages = totalPages(items.length, ECO_PENGUIN_ITEMS_PER_PAGE)

  useEffect(() => {
    if (pageItems.length > 0) {
      setTargetName(pickRandomItemName(pageItems))
    }
  }, [pageItems, categorySlug])

  useEffect(() => {
    if (!targetName) return
    const stop = playEcoPenguinSequence([
      buildWhichOneIntroUrl(),
      buildWhichQuestionAudioUrl(categorySlug, targetName),
    ])
    return stop
  }, [targetName, categorySlug])

  const replayQuestion = useCallback(() => {
    if (!targetName) return
    playEcoPenguinAudio(buildWhichQuestionAudioUrl(categorySlug, targetName))
  }, [targetName, categorySlug])

  const handleGuess = useCallback(
    (item: EcoPenguinItem) => {
      if (item.name === targetName) {
        playEcoPenguinAudio(buildCorrectAudioUrl(categorySlug, item.name))
        onCorrect(item)
        const pool = paginateItems(items, page, ECO_PENGUIN_ITEMS_PER_PAGE)
        setTargetName(pickRandomItemName(pool))
        return
      }
      setShakeItemId(item.id)
      window.setTimeout(() => setShakeItemId(null), 500)
      playEcoPenguinAudio(item.audio.error)
    },
    [targetName, categorySlug, items, page, onCorrect]
  )

  return {
    targetName,
    pageItems,
    pages,
    shakeItemId,
    replayQuestion,
    handleGuess,
    targetSlug: targetName ? itemNameToSlug(targetName) : '',
  }
}
