import wordsData from '@/data/blend-the-word/words.json'
import { resolveBlendWordAsset } from '@/lib/blend-the-word/assets'
import type { BlendWord } from '@/lib/blend-the-word/types'
import { unlockedLetterIds, wordFitsUnlockedLetters } from '@/lib/learning/learning-path'
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

/** Words whose graphemes are all in the learner's unlocked balloon letter sets. */
export async function getBlendWordsForMastery(masteredBalloonKeys: string[]): Promise<BlendWord[]> {
  const progress = computePhonicsProgress(masteredBalloonKeys)
  const unlocked = unlockedLetterIds(progress)
  const all = await getBlendWords()
  const filtered = all.filter((word) => wordFitsUnlockedLetters(word.graphemes, unlocked))
  // Guests / brand-new: still offer SATPIN-safe words (tap, pan, sit, pin)
  if (filtered.length === 0) {
    const satpin = unlockedLetterIds(computePhonicsProgress([]))
    return all.filter((word) => wordFitsUnlockedLetters(word.graphemes, satpin))
  }
  return filtered
}

export async function getBlendWordById(id: string): Promise<BlendWord | null> {
  const words = await getBlendWords()
  return words.find((word) => word.id === id) ?? null
}
