import wordsData from '@/data/consonant-blends/words.json'
import {
  resolveConsonantBlendAsset,
  type ConsonantBlendWord,
} from '@/lib/consonant-blends/constants'

function mapWord(word: ConsonantBlendWord): ConsonantBlendWord {
  return {
    ...word,
    image: resolveConsonantBlendAsset(word.image),
    audio: {
      blend: resolveConsonantBlendAsset(word.audio.blend),
      word: resolveConsonantBlendAsset(word.audio.word),
    },
  }
}

export async function getConsonantBlendWords(): Promise<ConsonantBlendWord[]> {
  return (wordsData as ConsonantBlendWord[]).map(mapWord)
}

export async function getConsonantBlendWordById(id: string): Promise<ConsonantBlendWord | null> {
  const all = await getConsonantBlendWords()
  return all.find((w) => w.id === id) ?? null
}
