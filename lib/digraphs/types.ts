import type { DigraphId } from '@/lib/digraphs/constants'

export type DigraphAudio = {
  word: string
  phoneme: string
  question: string
  success: string
  error: string
}

export type DigraphMeta = {
  id: DigraphId
  digraph: string
  letter: string
  phoneme: string
  label: string
  example: string
  image: string
  speak: { phoneme: string; question: string }
}

export type DigraphWord = {
  id: string
  word: string
  slug: string
  digraph: string
  graphemes: string[]
  image: string
  audio: DigraphAudio
  speakWord: string
}
