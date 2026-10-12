'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

const MUTE_KEY = 'ecopenguin:guide-muted'
export const ECO_GUIDE_AUDIO_BASE = '/eco-guide/audio'

const muteListeners = new Set<() => void>()

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function subscribeMuted(listener: () => void) {
  muteListeners.add(listener)
  return () => {
    muteListeners.delete(listener)
  }
}

function writeMuted(value: boolean) {
  try {
    window.localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  } catch {
    // ignore
  }
  muteListeners.forEach((listener) => listener())
}

/**
 * Plays Eco's spoken guide lines. Browsers block audio before the first tap, so a failed
 * auto-play simply leaves `blocked` true and the UI offers a "Hear Eco" button.
 */
export function useEcoVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const muted = useSyncExternalStore(subscribeMuted, readMuted, () => false)
  const mutedRef = useRef(muted)
  const playRef = useRef<((ids: string | string[], options?: { force?: boolean }) => void) | null>(null)

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setSpeaking(false)
  }, [])

  const play = useCallback(
    (ids: string | string[], options: { force?: boolean } = {}) => {
      const queue = Array.isArray(ids) ? ids : [ids]
      const [id, ...rest] = queue
      if (!id) return
      if (mutedRef.current && !options.force) return
      audioRef.current?.pause()
      const audio = new Audio(`${ECO_GUIDE_AUDIO_BASE}/${id}.mp3`)
      audioRef.current = audio
      audio.onplaying = () => setSpeaking(true)
      audio.onended = () => {
        setSpeaking(false)
        // Speak the next queued line, if any.
        if (rest.length > 0 && audioRef.current === audio) playRef.current?.(rest, options)
      }
      audio.onpause = () => setSpeaking(false)
      audio.onerror = () => setSpeaking(false)
      audio.play().then(
        () => setBlocked(false),
        () => {
          setSpeaking(false)
          setBlocked(true)
        }
      )
    },
    []
  )

  useEffect(() => {
    playRef.current = play
  }, [play])

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current
    writeMuted(next)
    if (next) stop()
  }, [stop])

  return { speaking, muted, blocked, play, stop, toggleMute }
}
