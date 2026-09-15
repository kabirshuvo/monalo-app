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
  setEcoPenguinMuted,
  stopEcoPenguinAudio,
} from '@/features/ecopenguin/hooks/ecoPenguinAudioManager'
import {
  readEcoPenguinMuted,
  readEcoPenguinShowWord,
  writeEcoPenguinMuted,
  writeEcoPenguinShowWord,
} from '@/lib/ecopenguin/session'

type EcoPenguinUiContextValue = {
  muted: boolean
  setMuted: (muted: boolean) => void
  toggleMute: () => void
  audioUnlocked: boolean
  unlockAudio: () => void
  showWord: boolean
  setShowWord: (show: boolean) => void
  toggleShowWord: () => void
}

const EcoPenguinUiContext = createContext<EcoPenguinUiContextValue | null>(null)

export function EcoPenguinUiProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMutedState] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [showWord, setShowWordState] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const nextMuted = readEcoPenguinMuted()
    setMutedState(nextMuted)
    setEcoPenguinMuted(nextMuted)
    setShowWordState(readEcoPenguinShowWord())
    setHydrated(true)
  }, [])

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next)
    setEcoPenguinMuted(next)
    writeEcoPenguinMuted(next)
    if (next) stopEcoPenguinAudio()
  }, [])

  const toggleMute = useCallback(() => {
    setMuted(!muted)
  }, [muted, setMuted])

  const unlockAudio = useCallback(() => {
    setAudioUnlocked(true)
  }, [])

  const setShowWord = useCallback((show: boolean) => {
    setShowWordState(show)
    writeEcoPenguinShowWord(show)
  }, [])

  const toggleShowWord = useCallback(() => {
    setShowWord(!showWord)
  }, [showWord, setShowWord])

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
    <EcoPenguinUiContext.Provider value={value}>{children}</EcoPenguinUiContext.Provider>
  )
}

export function useEcoPenguinUi(): EcoPenguinUiContextValue {
  const ctx = useContext(EcoPenguinUiContext)
  if (!ctx) {
    throw new Error('useEcoPenguinUi must be used within EcoPenguinUiProvider')
  }
  return ctx
}
