'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  playEcoPenguinAudio as playManagedAudio,
  stopEcoPenguinAudio,
} from '@/features/ecopenguin/hooks/ecoPenguinAudioManager'

export {
  playEcoPenguinAudio,
  playEcoPenguinSequence,
  stopEcoPenguinAudio,
} from '@/features/ecopenguin/hooks/ecoPenguinAudioManager'

export function useEcoPenguinAudio(src: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!src) return
    audioRef.current = new Audio(src)
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [src])

  const play = useCallback(() => {
    if (!src) return
    playManagedAudio(src)
  }, [src])

  return play
}

export function useStopEcoPenguinAudioOnUnmount(): void {
  useEffect(() => () => stopEcoPenguinAudio(), [])
}
