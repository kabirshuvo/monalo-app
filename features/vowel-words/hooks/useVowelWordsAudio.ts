'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  playVowelWordsAudio as playManaged,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'

export {
  playVowelWordsAudio,
  playVowelWordsSequence,
  stopVowelWordsAudio,
  setVowelWordsMuted,
  isVowelWordsMuted,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'

export function useStopVowelWordsAudioOnUnmount(): void {
  useEffect(() => () => stopVowelWordsAudio(), [])
}

export function useVowelWordsAudio(src: string | null, fallbackText?: string) {
  const ref = useRef({ src, fallbackText })
  ref.current = { src, fallbackText }

  return useCallback(() => {
    if (!ref.current.src) return
    playManaged(ref.current.src, { fallbackText: ref.current.fallbackText })
  }, [])
}
