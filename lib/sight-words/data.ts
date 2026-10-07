import wordsData from '@/data/sight-words/words.json'
import sentencesData from '@/data/sight-words/sentences.json'
import {
  resolveSightWordsAsset,
  type SightSentence,
  type SightWord,
} from '@/lib/sight-words/constants'

export async function getSightWords(): Promise<SightWord[]> {
  return (wordsData as SightWord[]).map((w) => ({
    ...w,
    audio: resolveSightWordsAsset(w.audio ?? `/audio/words/${w.id}.mp3`),
  }))
}

export async function getSightWordById(id: string): Promise<SightWord | null> {
  const all = await getSightWords()
  return all.find((w) => w.id === id) ?? null
}

export async function getSightSentences(): Promise<SightSentence[]> {
  return (sentencesData as SightSentence[]).map((s) => ({
    ...s,
    audio: resolveSightWordsAsset(s.audio ?? `/audio/sentences/${s.id}.mp3`),
  }))
}
