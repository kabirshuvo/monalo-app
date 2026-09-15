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
  setVowelWordsMuted,
  stopVowelWordsAudio,
} from '@/features/vowel-words/hooks/vowelWordsAudioManager'
import {
  readVowelWordsMuted,
  readVowelWordsShowWord,
  writeVowelWordsMuted,
  writeVowelWordsShowWord,
} from '@/lib/vowel-words/session'

type VowelWordsUiContextValue = {
  muted: boolean
  setMuted: (muted: boolean) => void
  toggleMute: () => void
  audioUnlocked: boolean
  unlockAudio: () => void
  showWord: boolean
  setShowWord: (show: boolean) => void
  toggleShowWord: () => void
}

const VowelWordsUiContext = createContext<VowelWordsUiContextValue | null>(null)

export function VowelWordsUiProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMutedState] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [showWord, setShowWordState] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const nextMuted = readVowelWordsMuted()
    setMutedState(nextMuted)
    setVowelWordsMuted(nextMuted)
    setShowWordState(readVowelWordsShowWord())
    setHydrated(true)
  }, [])

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next)
    setVowelWordsMuted(next)
    writeVowelWordsMuted(next)
    if (next) stopVowelWordsAudio()
  }, [])

  const toggleMute = useCallback(() => setMuted(!muted), [muted, setMuted])
  const unlockAudio = useCallback(() => setAudioUnlocked(true), [])
  const setShowWord = useCallback((show: boolean) => {
    setShowWordState(show)
    writeVowelWordsShowWord(show)
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
    <VowelWordsUiContext.Provider value={value}>{children}</VowelWordsUiContext.Provider>
  )
}

export function useVowelWordsUi(): VowelWordsUiContextValue {
  const ctx = useContext(VowelWordsUiContext)
  if (!ctx) throw new Error('useVowelWordsUi must be used within VowelWordsUiProvider')
  return ctx
}
