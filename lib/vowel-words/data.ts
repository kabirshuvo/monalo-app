import vowelsData from '@/data/vowel-words/vowels.json'
import wordsData from '@/data/vowel-words/words.json'
import { resolveVowelWordsAsset } from '@/lib/vowel-words/assets'
import { SHORT_VOWEL_IDS, type ShortVowelId } from '@/lib/vowel-words/constants'
import type { VowelMeta, VowelWord } from '@/lib/vowel-words/types'

type WordsJson = Record<string, VowelWord[]>

function mapVowel(meta: VowelMeta): VowelMeta {
  return {
    ...meta,
    image: resolveVowelWordsAsset(meta.image),
  }
}

function mapWord(word: VowelWord): VowelWord {
  return {
    ...word,
    image: resolveVowelWordsAsset(word.image),
    audio: {
      word: resolveVowelWordsAsset(word.audio.word),
      phoneme: resolveVowelWordsAsset(word.audio.phoneme),
      question: resolveVowelWordsAsset(word.audio.question),
      success: resolveVowelWordsAsset(word.audio.success),
      error: resolveVowelWordsAsset(word.audio.error),
    },
  }
}

export function isShortVowelId(id: string): id is ShortVowelId {
  return (SHORT_VOWEL_IDS as readonly string[]).includes(id)
}

export async function getVowels(): Promise<VowelMeta[]> {
  return (vowelsData as VowelMeta[]).map(mapVowel)
}

export async function getVowelById(id: string): Promise<VowelMeta | null> {
  if (!isShortVowelId(id)) return null
  const vowels = await getVowels()
  return vowels.find((v) => v.id === id) ?? null
}

export async function getWordsByVowelId(vowelId: string): Promise<VowelWord[]> {
  if (!isShortVowelId(vowelId)) return []
  const byVowel = wordsData as WordsJson
  return (byVowel[vowelId] ?? []).map(mapWord)
}

export async function getWordBySlug(
  vowelId: string,
  wordSlug: string
): Promise<VowelWord | null> {
  const words = await getWordsByVowelId(vowelId)
  return words.find((w) => w.slug === wordSlug || w.id === wordSlug) ?? null
}
