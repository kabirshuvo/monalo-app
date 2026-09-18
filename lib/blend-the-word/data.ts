import wordsData from '@/data/blend-the-word/words.json'
import { resolveBlendWordAsset } from '@/lib/blend-the-word/assets'
import type { BlendWord } from '@/lib/blend-the-word/types'
import { completedLetterIds, wordFitsUnlockedLetters } from '@/lib/learning/learning-path'
import { computePhonicsProgress } from '@/lib/learning/phonics-progress'
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

/**
 * Words whose graphemes are all in sticker-completed balloon sets.
 * Empty until the learner earns the SATPIN star (no guest dump of the full pack).
 */
export async function getBlendWordsForMastery(masteredBalloonKeys: string[]): Promise<BlendWord[]> {
  const progress = computePhonicsProgress(masteredBalloonKeys)
  const completed = completedLetterIds(progress)
  if (completed.size === 0) return []
  const all = await getBlendWords()
  return all.filter((word) => wordFitsUnlockedLetters(word.graphemes, completed))
}

export async function getBlendWordById(id: string): Promise<BlendWord | null> {
  const words = await getBlendWords()
  return words.find((word) => word.id === id) ?? null
}
