import type { ShortVowelId } from '@/lib/vowel-words/constants'

export type VowelWordAudio = {
  word: string
  phoneme: string
  question: string
  success: string
  error: string
  learn: string
  quiz: string
  successes: string[]
}

export type VowelMeta = {
  id: ShortVowelId
  letter: string
  phoneme: string
  label: string
  example: string
  image: string
  audio: {
    welcome: string
  }
  /** Spoken labels for speech-synthesis fallback */
  speak: {
    welcome: string
    phoneme: string
    question: string
  }
}

export type VowelWord = {
  id: string
  word: string
  slug: string
  pattern: 'CVC'
  graphemes: string[]
  image: string
  audio: VowelWordAudio
  /** Fallback when mp3 is missing */
  speakWord: string
  speak: {
    learn: string
    quiz: string
    success: string[]
  }
}
