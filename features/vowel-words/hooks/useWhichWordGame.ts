'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VOWEL_WORDS_PER_PAGE } from '@/lib/vowel-words/constants'
import { buildRoundDeck, paginateItems, shuffleItems, totalPages } from '@/lib/vowel-words/game'
import {
  playVowelWordsAudio,
  playVowelWordsSequence,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/useVowelWordsAudio'
import { useVowelWordsUi } from '@/features/vowel-words/context/VowelWordsUiContext'
import {
  clearLastCorrect,
  markRoundDeckFinished,
  readLastCorrect,
  readRoundDeck,
  removeNameFromRoundDeck,
  writeLastCorrect,
  writeRoundDeck,
} from '@/lib/vowel-words/session'
import type { VowelMeta, VowelWord } from '@/lib/vowel-words/types'

type Options = {
  vowel: VowelMeta
  words: VowelWord[]
  page: number
  preferUnmasteredWords?: string[]
  enabled?: boolean
  forceNewDeck?: boolean
  onCorrect: (word: VowelWord) => void
  onDeckEmpty?: () => void
}

function resolvePool(pageWords: VowelWord[], prefer?: string[]): string[] {
  const preferred = prefer?.length
    ? pageWords.filter((w) => prefer.includes(w.word)).map((w) => w.word)
    : []
  return preferred.length > 0 ? preferred : pageWords.map((w) => w.word)
}

function ensureRoundDeck(
  vowelId: string,
  page: number,
  pool: string[],
  forceNew: boolean
): string[] {
  const last = readLastCorrect()
  if (last && last.vowelId === vowelId && last.page === page) {
    removeNameFromRoundDeck(vowelId, page, last.word)
    clearLastCorrect()
  }

  if (forceNew) {
    const deck = buildRoundDeck(pool)
    writeRoundDeck(vowelId, page, deck)
    return deck
  }

  const stored = readRoundDeck(vowelId, page)
  if (stored !== null && stored.length === 0) return []

  if (stored === null) {
    const deck = buildRoundDeck(pool)
    writeRoundDeck(vowelId, page, deck)
    return deck
  }

  const pruned = stored.filter((n) => pool.includes(n))
  if (pruned.length !== stored.length) writeRoundDeck(vowelId, page, pruned)
  return pruned
}

export function useWhichWordGame({
  vowel,
  words,
  page,
  preferUnmasteredWords,
  enabled = true,
  forceNewDeck = false,
  onCorrect,
  onDeckEmpty,
}: Options) {
  const { audioUnlocked, muted } = useVowelWordsUi()
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
    () => shuffleItems(paginateItems(words, page, VOWEL_WORDS_PER_PAGE)),
    [words, page]
  )
  const pages = totalPages(words.length, VOWEL_WORDS_PER_PAGE)

  useEffect(() => {
    stopVowelWordsAudio()
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

    const deck = ensureRoundDeck(vowel.id, page, pool, useForce)
    if (deck.length === 0) {
      setTargetWord('')
      setDeckEmpty(true)
      onDeckEmptyRef.current?.()
      return
    }

    setDeckEmpty(false)
    setTargetWord(deck[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, vowel.id, page, pageWords, forceNewDeck])

  useEffect(() => {
    if (!enabled) forceNewConsumed.current = false
  }, [enabled])

  const playQuestionSequence = useCallback(() => {
    if (!targetWord || isLocked || muted) return
    setNeedsTapToListen(false)
    const target = pageWords.find((w) => w.word === targetWord)
    playVowelWordsSequence(
      [
        {
          src: target?.audio.phoneme ?? '',
          fallbackText: vowel.speak.phoneme,
        },
        {
          src: target?.audio.question ?? '',
          fallbackText: vowel.speak.question,
        },
        {
          src: target?.audio.word ?? '',
          fallbackText: targetWord,
        },
      ],
      { onBlocked: () => setNeedsTapToListen(true) }
    )
  }, [targetWord, isLocked, muted, vowel.speak, pageWords])

  useEffect(() => {
    if (!enabled || !targetWord || isLocked) return
    if (!audioUnlocked) {
      setNeedsTapToListen(true)
      return
    }
    if (muted) return
    playQuestionSequence()
    return () => stopVowelWordsAudio()
  }, [enabled, targetWord, isLocked, audioUnlocked, muted, playQuestionSequence])

  const replayQuestion = useCallback(() => {
    if (!targetWord || isLocked) return
    setNeedsTapToListen(false)
    setCoachMessage(null)
    playVowelWordsAudio(
      pageWords.find((w) => w.word === targetWord)?.audio.word ?? '',
      { fallbackText: targetWord }
    )
  }, [targetWord, isLocked, pageWords])

  const handleGuess = useCallback(
    (word: VowelWord) => {
      if (isLocked || !enabled) return

      if (word.word === targetWord) {
        setIsLocked(true)
        setCoachMessage(null)
        stopVowelWordsAudio()
        const remaining = removeNameFromRoundDeck(vowel.id, page, word.word)
        writeLastCorrect({ vowelId: vowel.id, page, word: word.word })
        if (remaining.length === 0) {
          markRoundDeckFinished(vowel.id, page)
          setDeckEmpty(true)
        }
        onCorrect(word)
        return
      }

      stopVowelWordsAudio()
      setShakeId(word.id)
      setWrongIds((prev) => (prev.includes(word.id) ? prev : [...prev, word.id]))
      setCoachMessage('Not that one — listen again')
      window.setTimeout(() => setShakeId(null), 500)
      playVowelWordsAudio(word.audio.error, {
        fallbackText: 'Try again',
        onEnded: () => {
          if (!muted) {
            playVowelWordsAudio(word.audio.word, { fallbackText: targetWord })
          }
        },
      })
    },
    [targetWord, vowel.id, page, isLocked, onCorrect, enabled, muted]
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
