'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DIGRAPHS_PER_PAGE } from '@/lib/digraphs/constants'
import { buildRoundDeck, paginateItems, shuffleItems, totalPages } from '@/lib/digraphs/game'
import {
  playDigraphsAudio,
  playDigraphsSequence,
  stopDigraphsAudio,
} from '@/features/digraphs/hooks/useDigraphsAudio'
import { useDigraphsUi } from '@/features/digraphs/context/DigraphsUiContext'
import {
  clearLastCorrect,
  markRoundDeckFinished,
  readLastCorrect,
  readRoundDeck,
  removeNameFromRoundDeck,
  writeLastCorrect,
  writeRoundDeck,
} from '@/lib/digraphs/session'
import type { DigraphMeta, DigraphWord } from '@/lib/digraphs/types'

type Options = {
  digraph: DigraphMeta
  words: DigraphWord[]
  page: number
  preferUnmasteredWords?: string[]
  enabled?: boolean
  forceNewDeck?: boolean
  onCorrect: (word: DigraphWord) => void
  onDeckEmpty?: () => void
}

function resolvePool(pageWords: DigraphWord[], prefer?: string[]): string[] {
  const preferred = prefer?.length
    ? pageWords.filter((w) => prefer.includes(w.word)).map((w) => w.word)
    : []
  return preferred.length > 0 ? preferred : pageWords.map((w) => w.word)
}

function ensureRoundDeck(
  digraphId: string,
  page: number,
  pool: string[],
  forceNew: boolean
): string[] {
  const last = readLastCorrect()
  if (last && last.digraphId === digraphId && last.page === page) {
    removeNameFromRoundDeck(digraphId, page, last.word)
    clearLastCorrect()
  }

  if (forceNew) {
    const deck = buildRoundDeck(pool)
    writeRoundDeck(digraphId, page, deck)
    return deck
  }

  const stored = readRoundDeck(digraphId, page)
  if (stored !== null && stored.length === 0) return []

  if (stored === null) {
    const deck = buildRoundDeck(pool)
    writeRoundDeck(digraphId, page, deck)
    return deck
  }

  const pruned = stored.filter((n) => pool.includes(n))
  if (pruned.length !== stored.length) writeRoundDeck(digraphId, page, pruned)
  return pruned
}

export function useWhichDigraphGame({
  digraph,
  words,
  page,
  preferUnmasteredWords,
  enabled = true,
  forceNewDeck = false,
  onCorrect,
  onDeckEmpty,
}: Options) {
  const { audioUnlocked, muted } = useDigraphsUi()
  const [targetWord, setTargetWord] = useState('')
  const [shakeId, setShakeId] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const [needsTapToListen, setNeedsTapToListen] = useState(false)
  const [deckEmpty, setDeckEmpty] = useState(false)

  const onDeckEmptyRef = useRef(onDeckEmpty)
  onDeckEmptyRef.current = onDeckEmpty
  const forceNewConsumed = useRef(false)

  const pageWords = useMemo(
    () => shuffleItems(paginateItems(words, page, DIGRAPHS_PER_PAGE)),
    [words, page]
  )
  const pages = totalPages(words.length, DIGRAPHS_PER_PAGE)

  useEffect(() => {
    stopDigraphsAudio()
    setIsLocked(false)
    setShakeId(null)
    setWrongIds([])
    setCoachMessage(null)
    setNeedsTapToListen(false)

    if (!enabled || pageWords.length === 0) {
      setTargetWord('')
      setDeckEmpty(false)
      return
    }

    const pool = resolvePool(pageWords, preferUnmasteredWords)
    const useForce = forceNewDeck && !forceNewConsumed.current
    if (useForce) forceNewConsumed.current = true

    const deck = ensureRoundDeck(digraph.id, page, pool, useForce)
    if (deck.length === 0) {
      setTargetWord('')
      setDeckEmpty(true)
      onDeckEmptyRef.current?.()
      return
    }

    setDeckEmpty(false)
    setTargetWord(deck[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, digraph.id, page, pageWords, forceNewDeck])

  useEffect(() => {
    if (!enabled) forceNewConsumed.current = false
  }, [enabled])

  const playQuestionSequence = useCallback(() => {
    if (!targetWord || isLocked || muted) return
    setNeedsTapToListen(false)
    const target = pageWords.find((w) => w.word === targetWord)
    playDigraphsSequence(
      [
        {
          src: target?.audio.phoneme ?? '',
          fallbackText: digraph.speak.phoneme,
        },
        {
          src: target?.audio.question ?? '',
          fallbackText: digraph.speak.question,
        },
        {
          src: target?.audio.word ?? '',
          fallbackText: targetWord,
        },
      ],
      { onBlocked: () => setNeedsTapToListen(true) }
    )
  }, [targetWord, isLocked, muted, digraph.speak, pageWords])

  useEffect(() => {
    if (!enabled || !targetWord || isLocked) return
    if (!audioUnlocked) {
      setNeedsTapToListen(true)
      return
    }
    if (muted) return
    playQuestionSequence()
    return () => stopDigraphsAudio()
  }, [enabled, targetWord, isLocked, audioUnlocked, muted, playQuestionSequence])

  const replayQuestion = useCallback(() => {
    if (!targetWord || isLocked) return
    setNeedsTapToListen(false)
    setCoachMessage(null)
    playDigraphsAudio(
      pageWords.find((w) => w.word === targetWord)?.audio.word ?? '',
      { fallbackText: targetWord }
    )
  }, [targetWord, isLocked, pageWords])

  const handleGuess = useCallback(
    (word: DigraphWord) => {
      if (isLocked || !enabled) return

      if (word.word === targetWord) {
        setIsLocked(true)
        setCoachMessage(null)
        stopDigraphsAudio()
        const remaining = removeNameFromRoundDeck(digraph.id, page, word.word)
        writeLastCorrect({ digraphId: digraph.id, page, word: word.word })
        if (remaining.length === 0) {
          markRoundDeckFinished(digraph.id, page)
          setDeckEmpty(true)
        }
        onCorrect(word)
        return
      }

      stopDigraphsAudio()
      setShakeId(word.id)
      setWrongIds((prev) => (prev.includes(word.id) ? prev : [...prev, word.id]))
      setCoachMessage('Not that one — listen again')
      window.setTimeout(() => setShakeId(null), 500)
      playDigraphsAudio(word.audio.error, {
        fallbackText: 'Try again',
        onEnded: () => {
          if (!muted) {
            playDigraphsAudio(word.audio.word, { fallbackText: targetWord })
          }
        },
      })
    },
    [targetWord, digraph.id, page, isLocked, onCorrect, enabled, muted]
  )

  return {
    targetWord,
    pageWords,
    pages,
    shakeId,
    isLocked,
    wrongIds,
    coachMessage,
    needsTapToListen,
    deckEmpty,
    replayQuestion,
    playQuestionSequence,
    handleGuess,
  }
}
