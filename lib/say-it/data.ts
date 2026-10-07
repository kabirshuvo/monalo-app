import promptsData from '@/data/say-it/prompts.json'
import { resolveVowelWordsAsset } from '@/lib/vowel-words/assets'
import { resolveSayItAsset, type SayItPrompt } from '@/lib/say-it/constants'

export async function getSayItPrompts(): Promise<SayItPrompt[]> {
  return (promptsData as SayItPrompt[]).map((p) => ({
    ...p,
    image: p.image ? resolveVowelWordsAsset(p.image) : null,
    audio: resolveSayItAsset(p.audio ?? `/audio/prompts/${p.id}.mp3`),
  }))
}

export async function getSayItPromptById(id: string): Promise<SayItPrompt | null> {
  const all = await getSayItPrompts()
  return all.find((p) => p.id === id) ?? null
}
