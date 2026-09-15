import digraphsData from '@/data/digraphs/digraphs.json'
import wordsData from '@/data/digraphs/words.json'
import { resolveDigraphsAsset } from '@/lib/digraphs/assets'
import { DIGRAPH_IDS, type DigraphId } from '@/lib/digraphs/constants'
import type { DigraphMeta, DigraphWord } from '@/lib/digraphs/types'

type WordsJson = Record<string, DigraphWord[]>

export function isDigraphId(id: string): id is DigraphId {
  return (DIGRAPH_IDS as readonly string[]).includes(id)
}

export async function getDigraphs(): Promise<DigraphMeta[]> {
  return (digraphsData as DigraphMeta[]).map((d) => ({
    ...d,
    image: resolveDigraphsAsset(d.image),
  }))
}

export async function getDigraphById(id: string): Promise<DigraphMeta | null> {
  if (!isDigraphId(id)) return null
  return (await getDigraphs()).find((d) => d.id === id) ?? null
}

export async function getWordsByDigraphId(id: string): Promise<DigraphWord[]> {
  if (!isDigraphId(id)) return []
  const list = (wordsData as WordsJson)[id] ?? []
  return list.map((w) => ({
    ...w,
    image: resolveDigraphsAsset(w.image),
    audio: {
      word: resolveDigraphsAsset(w.audio.word),
      phoneme: resolveDigraphsAsset(w.audio.phoneme),
      question: resolveDigraphsAsset(w.audio.question),
      success: resolveDigraphsAsset(w.audio.success),
      error: resolveDigraphsAsset(w.audio.error),
    },
  }))
}

export async function getDigraphWordBySlug(id: string, slug: string): Promise<DigraphWord | null> {
  const words = await getWordsByDigraphId(id)
  return words.find((w) => w.slug === slug || w.id === slug) ?? null
}
