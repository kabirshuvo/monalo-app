import wordsData from '@/data/blend-the-word/words.json'
import { resolveBlendWordAsset } from '@/lib/blend-the-word/assets'
import type { BlendWord } from '@/lib/blend-the-word/types'
import { resolveVowelWordsAsset } from '@/lib/vowel-words/assets'

function mapWord(word: BlendWord): BlendWord {
  return {
    ...word,
    image: resolveVowelWordsAsset(word.image),
    audio: {
      sounds: resolveBlendWordAsset(word.audio.sounds),
      word: resolveVowelWordsAsset(word.audio.word),
    },
  }
}

export async function getBlendWords(): Promise<BlendWord[]> {
  return (wordsData as BlendWord[]).map(mapWord)
}

export async function getBlendWordById(id: string): Promise<BlendWord | null> {
  const words = await getBlendWords()
  return words.find((word) => word.id === id) ?? null
}
