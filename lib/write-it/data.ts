import sentencesData from '@/data/write-it/sentences.json'
import lettersData from '@/data/write-it/letters.json'
import {
  resolveWriteItAsset,
  type WriteItLetter,
  type WriteItSentence,
} from '@/lib/write-it/constants'

export async function getWriteItSentences(): Promise<WriteItSentence[]> {
  return (sentencesData as WriteItSentence[]).map((s) => ({
    ...s,
    audio: resolveWriteItAsset(s.audio ?? `/audio/sentences/${s.id}.mp3`),
  }))
}

export async function getWriteItSentenceById(id: string): Promise<WriteItSentence | null> {
  const all = await getWriteItSentences()
  return all.find((s) => s.id === id) ?? null
}

export async function getWriteItLetters(): Promise<WriteItLetter[]> {
  return (lettersData as WriteItLetter[]).map((l) => ({
    ...l,
    audio: resolveWriteItAsset(l.audio ?? `/audio/letters/${l.id}.mp3`),
  }))
}

export async function getWriteItLetterById(id: string): Promise<WriteItLetter | null> {
  const all = await getWriteItLetters()
  return all.find((l) => l.id === id) ?? null
}
