import setsData from '@/data/nursery-rhyme/sets.json'
import { resolveVowelWordsAsset } from '@/lib/vowel-words/assets'
import {
  resolveNurseryRhymeAsset,
  type NurseryRhymeSet,
} from '@/lib/nursery-rhyme/constants'

export async function getNurseryRhymeSets(): Promise<NurseryRhymeSet[]> {
  return (setsData as NurseryRhymeSet[]).map((set) => ({
    ...set,
    audio: set.audio
      ? resolveNurseryRhymeAsset(set.audio)
      : resolveNurseryRhymeAsset(`/audio/sets/${set.id}.mp3`),
    choices: set.choices.map((c) => ({
      ...c,
      image: resolveVowelWordsAsset(c.image),
    })),
  }))
}

export async function getNurseryRhymeSetById(id: string): Promise<NurseryRhymeSet | null> {
  const all = await getNurseryRhymeSets()
  return all.find((s) => s.id === id) ?? null
}
