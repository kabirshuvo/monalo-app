'use client'

import { useCallback, useEffect, useRef } from 'react'

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
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    void audioRef.current.play().catch(() => {})
  }, [])

  return play
}

export function playEcoPenguinAudio(src: string): void {
  const audio = new Audio(src)
  void audio.play().catch(() => {})
}

export function playEcoPenguinSequence(urls: string[]): () => void {
  let index = 0
  let current: HTMLAudioElement | null = null

  const playNext = () => {
    if (index >= urls.length) return
    current?.pause()
    current = new Audio(urls[index])
    index += 1
    current.addEventListener('ended', playNext)
    void current.play().catch(playNext)
  }

  playNext()

  return () => {
    current?.pause()
    current = null
  }
}
