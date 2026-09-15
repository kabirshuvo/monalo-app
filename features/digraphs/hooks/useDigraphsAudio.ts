'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  playDigraphsAudio as playManaged,
  stopDigraphsAudio,
} from '@/features/digraphs/hooks/digraphsAudioManager'

export {
  playDigraphsAudio,
  playDigraphsSequence,
  stopDigraphsAudio,
  setDigraphsMuted,
} from '@/features/digraphs/hooks/digraphsAudioManager'

export function useStopDigraphsAudioOnUnmount(): void {
  useEffect(() => () => stopDigraphsAudio(), [])
}

export function useDigraphsAudio(src: string | null, fallbackText?: string) {
  const ref = useRef({ src, fallbackText })
  ref.current = { src, fallbackText }

  return useCallback(() => {
    if (!ref.current.src) return
    playManaged(ref.current.src, { fallbackText: ref.current.fallbackText })
  }, [])
}
