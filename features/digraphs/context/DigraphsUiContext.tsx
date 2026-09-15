'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  setDigraphsMuted,
  stopDigraphsAudio,
} from '@/features/digraphs/hooks/digraphsAudioManager'
import {
  readDigraphsMuted,
  readDigraphsShowWord,
  writeDigraphsMuted,
  writeDigraphsShowWord,
} from '@/lib/digraphs/session'

type DigraphsUiContextValue = {
  muted: boolean
  setMuted: (muted: boolean) => void
  toggleMute: () => void
  audioUnlocked: boolean
  unlockAudio: () => void
  showWord: boolean
  setShowWord: (show: boolean) => void
  toggleShowWord: () => void
}

const DigraphsUiContext = createContext<DigraphsUiContextValue | null>(null)

export function DigraphsUiProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMutedState] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [showWord, setShowWordState] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const nextMuted = readDigraphsMuted()
    setMutedState(nextMuted)
    setDigraphsMuted(nextMuted)
    setShowWordState(readDigraphsShowWord())
    setHydrated(true)
  }, [])

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next)
    setDigraphsMuted(next)
    writeDigraphsMuted(next)
    if (next) stopDigraphsAudio()
  }, [])

  const toggleMute = useCallback(() => setMuted(!muted), [muted, setMuted])
  const unlockAudio = useCallback(() => setAudioUnlocked(true), [])
  const setShowWord = useCallback((show: boolean) => {
    setShowWordState(show)
    writeDigraphsShowWord(show)
  }, [])
  const toggleShowWord = useCallback(() => setShowWord(!showWord), [showWord, setShowWord])

  const value = useMemo(
    () => ({
      muted: hydrated ? muted : false,
      setMuted,
      toggleMute,
      audioUnlocked,
      unlockAudio,
      showWord: hydrated ? showWord : false,
      setShowWord,
      toggleShowWord,
    }),
    [
      hydrated,
      muted,
      setMuted,
      toggleMute,
      audioUnlocked,
      unlockAudio,
      showWord,
      setShowWord,
      toggleShowWord,
    ]
  )

  return (
    <DigraphsUiContext.Provider value={value}>{children}</DigraphsUiContext.Provider>
  )
}

export function useDigraphsUi(): DigraphsUiContextValue {
  const ctx = useContext(DigraphsUiContext)
  if (!ctx) throw new Error('useDigraphsUi must be used within DigraphsUiProvider')
  return ctx
}
